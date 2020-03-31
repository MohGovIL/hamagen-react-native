import crypto from 'isomorphic-webcrypto';
import ab2b64 from 'base64-arraybuffer';
import axios from 'axios';
import { Base64 } from 'js-base64';
import { onError } from './ErrorService';
import publicJwkKeyData from '../keys/publicJwk.json';
import { SickJSON } from '../types';

const SIGNATURE_LENGTH = 64;

export const downloadAndVerifySigning = (url: string) => new Promise<SickJSON>(async (resolve, reject) => {
  try {
    const signatureWithDataB64 = await axios.get(`${'https://matrixdemos.blob.core.windows.net/mabar/Points.signed.json.b64'}?r=${Math.random()}`, { headers: { 'Content-Type': 'application/json;charset=utf-8' } });

    const signatureWithData = ab2b64.decode(signatureWithDataB64.data);

    const signature = signatureWithData.slice(0, SIGNATURE_LENGTH);

    const data = signatureWithData.slice(SIGNATURE_LENGTH);

    // @ts-ignore
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      publicJwkKeyData,
      {
        name: 'ECDSA',
        namedCurve: 'P-256'
      },
      false,
      ['verify']
    );

    // @ts-ignore
    const isValid = await crypto.subtle.verify(
      {
        name: 'ECDSA',
        hash: { name: 'SHA-256' } // can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
      },
      publicKey, // from generateKey or importKey above
      signature, // ArrayBuffer of the signature
      data // ArrayBuffer of the data
    );

    if (isValid) {
      const dataAsBase64 = ab2b64.encode(data);
      const responseJson: SickJSON = JSON.parse(Base64.decode(dataAsBase64));

      resolve(responseJson);
    } else {
      onError({ error: 'Unapproved source' });
      reject('Unapproved source');
    }
  } catch (error) {
    reject(error);
    onError({ error });
  }
});
