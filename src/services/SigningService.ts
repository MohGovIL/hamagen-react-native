import crypto from 'isomorphic-webcrypto';
import ab2b64 from 'base64-arraybuffer';
import axios from 'axios';
import publicJwkKeyData from '../keys/publicJwk.json';
import { onError } from './ErrorService';

const SIGNATURE_LENGTH = 64;

export const downloadAndVerifySigning = (url: string) => new Promise(async (resolve, reject) => {
  try {
    const signatureWithDataB64 = await axios.get(`${'https://matrixdemos.blob.core.windows.net/mabar/Points.signed.json.b64'}?r=${Math.random()}`, { headers: { 'Content-Type': 'application/json;charset=utf-8' } });
    debugger;
    const signatureWithData = ab2b64.decode(signatureWithDataB64.data);
    debugger;
    const signature = signatureWithData.slice(0, SIGNATURE_LENGTH);
    debugger;
    const data = signatureWithData.slice(SIGNATURE_LENGTH);
    debugger;
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
    debugger;
    const isValid = await crypto.subtle.verify(
      {
        name: 'ECDSA',
        hash: { name: 'SHA-256' } // can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
      },
      publicKey, // from generateKey or importKey above
      signature, // ArrayBuffer of the signature
      data // ArrayBuffer of the data
    );
    debugger;
    if (isValid) {
      resolve(data);
    } else {
      onError({ error: 'Unapproved source' });
      reject('Unapproved source');
    }
  } catch (error) {
    const x = error;
    debugger;
    onError({ error });
  }
});
