import { writeFile } from 'fs'


const stubRedirects = () => {
    const ac = process.env.SELF_ACTOR
    const sn = process.env.SITE_NAME
    const redirs = []

    redirs.push({
      from: "/.well-known/webfinger", to: "/webfinger.json", status: 200, query: "resource=acct:" + ac.concat("@", sn, ".netlify.app"),},{
      from: "/.well-known/webfinger", to: "/webfinger.json", status: 200, query: "resource=mailto:" + ac.concat("@", sn, ".netlify.app"),},{
      from: "/.well-known/webfinger", to: "/webfinger.json", status: 200, query: "resource=https://" + sn.concat(".netlify.app/"),},{
      from: "/.well-known/webfinger", to: "/webfinger.json", status: 200, query: "resource=https://" + sn.concat(".netlify.app"),},{
      from: "/u/" + ac + "/followers", to: "/followers.json", status: 200,},{
      from: "/u/" + ac + "/following", to: "/following.json", status: 200,},{
      from: "/u/@" + ac, to: "/u/" + ac, status: 200,},{
      from: "/u/" + ac, to: "/actor.json", status: 200,},{
      from: "/api/*", to: "/.netlify/functions/:splat", status: 200,
    })

    return redirs
}

const stubSkeleton = () => {
    // create the followers/following/webfinger .json 
    // skeleton templates in ./public

    const ac = process.env.SELF_ACTOR
    const sn = process.env.SITE_NAME

    const followers = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: 'https://' + sn.concat('.netlify.app/u/', ac, '/followers') ,
      type: 'OrderedCollection',
      totalItems: 1,
      first: 'https://' + sn.concat('.netlify.app/follower_accts')
    }

    const following = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: 'https://' + sn.concat('.netlify.app/u/', ac, '/following') ,
      type: 'OrderedCollection',
      totalItems: 1,
      first: 'https://' + sn.concat('.netlify.app/following_accts')
    }

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
    }

    writeFile('./public/followers.json', JSON.stringify(followers), (error) => {
      if (error) { console.log('Fail followers.json ', error) }
    })
    writeFile('./public/following.json', JSON.stringify(following), (error) => {
      if (error) { console.log('Fail following.json ', error) }
    })
    writeFile('./public/webfinger.json', JSON.stringify(webfinger), (error) => {
      if (error) { console.log('Fail webfinger.json ', error) }
    })
}

export { stubRedirects, stubSkeleton }

