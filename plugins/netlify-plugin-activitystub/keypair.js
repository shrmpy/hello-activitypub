import { writeFileSync } from 'fs'
import { request } from 'https'
import { promisify } from 'util'
import { generateKeyPair, randomBytes } from 'crypto'

const stubActor = async () => {
    const ac = process.env.SELF_ACTOR
    const sn = process.env.SITE_NAME
    const tmprd = []

    const dt = new Date()
    const pubdt = dt.toISOString()
    const tmpfrom = '/l/' + pubdt.replace(/\W/g, '')
    const tmpto = '/' + randomBytes(16).toString('hex') + '.pem'
    tmprd.push({ from: tmpfrom, to: tmpto, status: 200 })

    const pair = await promisify(generateKeyPair)('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
    });

    // webhook for now (faunadb next)
    if (process.env.DISCORD_WEBHOOK != "") {
        const shortLink = 'https://' + sn.concat('.netlify.app', tmpfrom)
        const notifi = {
          username: 'build-plugin-activitystub',
          avatar_url: process.env.GITHUB_AVATAR,
          content: shortLink,
        }
        const whbody = JSON.stringify(notifi)
        const wh = new URL(process.env.DISCORD_WEBHOOK)
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': whbody.length,
          },
        }

        // invoke webhook
        const req = request(wh, options, (res) => {})
        req.on('error', (error) => {
          console.error(error)
        })
        req.write(whbody)
        req.end()

        ////const priv = { data: 'pem', body: pair.privateKey }
        writeFileSync('./public' + tmpto, pair.privateKey)
    }

    // actor template
    const person = {
      '@context': ['https://www.w3.org/ns/activitystreams','https://w3id.org/security/v1'],
      id: 'https://' + sn.concat('.netlify.app/u/', ac) ,
      type: 'Person',
      following: 'https://' + sn.concat('.netlify.app/u/', ac, '/following') ,
      followers: 'https://' + sn.concat('.netlify.app/u/', ac, '/followers') ,
      inbox: 'https://' + sn.concat('.netlify.app/api/inbox') ,
      outbox: 'https://' + sn.concat('.netlify.app/api/sort') ,
      name: ac,
      preferredUsername: ac,
      summary: 'static activitypub demo',
      manuallyApprovesFollowers: true,
      discoverable: true,
      publicKey: {
        id: 'https://' + sn.concat('.netlify.app/u/', ac, '#main-key') ,
        owner: 'https://' + sn.concat('.netlify.app/u/', ac) ,
        publicKeyPem: pair.publicKey
      },
      published: pubdt
    }

      writeFileSync('./public/actor.json', JSON.stringify(person))

    // return and let invoking parent add the redirect
    return tmprd
}

export { stubActor }

