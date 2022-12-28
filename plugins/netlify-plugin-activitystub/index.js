import { writeFile } from "fs"
import { generateKeyPair } from "crypto"

export const onPreBuild = async function({ netlifyConfig }) {
    // we can call generator (but the coupling)
    ////await run.command("go run examples/gen.go");
    const ac = process.env.SELF_ACTOR;
    const sn = process.env.SITE_NAME;

    // define redirects
    netlifyConfig.redirects.push({
      from: "/.well-known/webfinger", to: "/webfinger.json", status: 200, query: "resource=acct:" + ac.concat("@", sn, ".netlify.app"),},{
      from: "/.well-known/webfinger", to: "/webfinger.json", status: 200, query: "resource=mailto:" + ac.concat("@", sn, ".netlify.app"),},{
      from: "/.well-known/webfinger", to: "/webfinger.json", status: 200, query: "resource=https://" + sn.concat(".netlify.app/"),},{
      from: "/.well-known/webfinger", to: "/webfinger.json", status: 200, query: "resource=https://" + sn.concat(".netlify.app"),},{
      from: "/u/" + ac + "/followers", to: "/followers.json", status: 200,},{
      from: "/u/" + ac + "/following", to: "/following.json", status: 200,},{
      from: "/u/@" + ac, to: "/u/" + ac, status: 200,},{
      from: "/u/" + ac, to: "/actor.json", status: 200,},{
      from: "/api/*", to: "/.netlify/functions/:splat", status: 200,
    });

    // follow templates
    const followers = {
      "@context": "https://www.w3.org/ns/activitystreams",
      id: "https://" + sn.concat(".netlify.app/u/", ac, "/followers") ,
      type: "OrderedCollection",
      totalItems: 1,
      first: "https://" + sn.concat(".netlify.app/follower_accts")
    };
    const following = {
      "@context": "https://www.w3.org/ns/activitystreams",
      id: "https://" + sn.concat(".netlify.app/u/", ac, "/following") ,
      type: "OrderedCollection",
      totalItems: 1,
      first: "https://" + sn.concat(".netlify.app/following_accts")
    };
    writeFile("./public/followers.json", JSON.stringify(followers), (error) => {
      if (error) {
        console.log("Fail followers.json ", error);
      }
    });
    writeFile("./public/following.json", JSON.stringify(following), (error) => {
      if (error) {
        console.log("Fail following.json ", error);
      }
    });

    generateKeyPair('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    }, (err, publicKey, privateKey) => {
      // TODO save priv key as env var with api util?
      let dt = new Date();
    // actor template
    const person = {
      "@context": ["https://www.w3.org/ns/activitystreams", "https://w3id.org/security/v1"],
      id: "https://" + sn.concat(".netlify.app/u/", ac) ,
      type: "Person",
      following: "https://" + sn.concat(".netlify.app/u/", ac, "/following") ,
      followers: "https://" + sn.concat(".netlify.app/u/", ac, "/followers") ,
      inbox: "https://" + sn.concat(".netlify.app/api/inbox") ,
      outbox: "https://" + sn.concat(".netlify.app/api/sort") ,
      name: ac,
      preferredUsername: ac,
      summary: "static activitypub demo",
      manuallyApprovesFollowers: true,
      discoverable: true,
      publicKey: {
        id: "https://" + sn.concat(".netlify.app/u/", ac, "#main-key") ,
        owner: "https://" + sn.concat(".netlify.app/u/", ac) ,
        publicKeyPem: publicKey
      },
      published: dt.toISOString()
    };
      writeFile("./public/actor.json", JSON.stringify(person), (error) => {
        if (error) {
          console.log("Fail actor.json ", error);
        }
      });

    });

    // TODO headers 
    //console.log("hdr, " + netlifyConfig.headers);
}

////  onBuild: () => {},
////  onPostBuild: () => {},
////  onError: () => {},

