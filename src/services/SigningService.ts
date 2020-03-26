const crypto = require('isomorphic-webcrypto');
const ab2b64 = require('base64-arraybuffer');

export const downloadAndVerifySigning = (url: string) => new Promise((resolve, reject) => {
  const signatureWithDataB64 = fs.readFileSync(
    "./data/Points.signed.json.b64",
    { encoding: "utf8" }
  );
  const signatureWithData = ab2b64.decode(signatureWithDataB64);
  const signature = signatureWithData.slice(0, SIGNATURE_LENGTH);
  const data = signatureWithData.slice(SIGNATURE_LENGTH);
  const publicJwkKeyData = JSON.parse(fs.readFileSync("./keys/publicJwk.json"));
  const publicKey = await crypto.subtle.importKey(
    "jwk",
    publicJwkKeyData,
    {
      name: "ECDSA",
      namedCurve: "P-256"
    },
    false,
    ["verify"]
  );

  const isValid = await crypto.subtle.verify(
    {
      name: "ECDSA",
      hash: { name: "SHA-256" } //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
    },
    publicKey, //from generateKey or importKey above
    signature, //ArrayBuffer of the signature
    data //ArrayBuffer of the data
  );
  console.log(isValid);
});
