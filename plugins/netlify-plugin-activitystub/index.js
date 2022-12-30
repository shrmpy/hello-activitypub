import { writeFile } from 'fs'
import { generateKeyPair, randomBytes } from 'crypto'
import { request } from 'https'

export const onPreBuild = async function({ netlifyConfig, constants }) {
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

    // templates
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
    const webfinger = {
      subject: 'acct:' + ac.concat('@', sn, '.netlify.app') ,
      aliases: [
        'https://' + sn.concat('.netlify.app/@', ac) ,
        'https://' + sn.concat('.netlify.app/u/', ac) ,
      ],
      links: [{
        rel: 'self',
        type: 'application/activity+json',
        href: 'https://' + sn.concat('.netlify.app/u/', ac) ,
      }],
    };
    writeFile('./public/followers.json', JSON.stringify(followers), (error) => {
      if (error) {
        console.log('Fail followers.json ', error);
      }
    });
    writeFile('./public/following.json', JSON.stringify(following), (error) => {
      if (error) {
        console.log('Fail following.json ', error);
      }
    });
    writeFile('./public/webfinger.json', JSON.stringify(webfinger), (error) => {
      if (error) {
        console.log('Fail webfinger.json ', error);
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
      let dt = new Date();
      const pubdt = dt.toISOString();
      // webhook for now (faunadb next)
      if (process.env.DISCORD_WEBHOOK != "") {
        const tmpid = randomBytes(16).toString('hex');
        const shortLink = 'https://' + sn.concat('.netlify.app/l/', pubdt);
        const notifi = {
          username: 'build-plugin-activitystub',
          avatar_url: process.env.GITHUB_AVATAR,
          content: shortLink,
        };
        const whbody = JSON.stringify(notifi);
        const wh = new URL(process.env.DISCORD_WEBHOOK);
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': whbody.length,
          },
        };
        const req = request(wh, options, (res) => {});
        req.on('error', (error) => {
          console.error(error)
        });
        req.write(whbody);
        req.end();
        netlifyConfig.redirects.push({
          from: '/l/' + pubdt, to: '/' + tmpid.concat('.json'), status: 200,
        });
        const priv = { data: 'pem', body: privateKey }
        writeFile('./public/' + tmpid.concat('.json'), JSON.stringify(priv), (error) => {
          if (error) {
            console.log('Fail priv ', error);
          }
        });

      }


    // actor template
    const person = {
      '@context': ['https://www.w3.org/ns/activitystreams','https://w3id.org/security/v1'],
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
      published: pubdt
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

