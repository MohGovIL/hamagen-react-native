import axios from 'axios';
import KJUR from 'jsrsasign';
import { onError } from './ErrorService';

export const downloadAndVerifySigning = (url: string) => new Promise<any>(async (resolve, reject) => {
  try {
    const { data }: { data: string } = await axios.get(`${url}.sign?r=${Math.random()}`, { headers: { 'Content-Type': 'application/json;charset=utf-8' } });

    const curve = 'secp256r1';
    const sigalg = 'SHA256withECDSA';
    const pubkey = '04c9635247abc25e9edf80bbebaa0ed74b4c4febeff3237787fb86d675a9f8dd878f9ec5d91fd4219496192ee10ed3daa36df2acf966a1bd9df7ee3d1c299f3260';

    const signatureLength = data.indexOf('{');

    const signature = data.slice(0, signatureLength);

    const jsonB64 = data.slice(signatureLength);

    const json = JSON.parse(jsonB64);



    // @ts-ignore
    const sig = new KJUR.crypto.Signature({ alg: sigalg, prov: 'cryptojs/jsrsa' });

    sig.init({ xy: pubkey, curve });

    sig.updateString(jsonB64);

    const result = sig.verify(signature);

    
    if (result) {
      resolve(json);
    }
    
    reject('invalid ECDSA signature');

  } catch (error) {
    reject(error);
    onError({ error });
  }
});
