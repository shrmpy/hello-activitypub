import { stubRedirects, stubSkeleton } from './formatters.js'
import { stubActor } from './keypair.js'

export const onPreBuild = async function({ netlifyConfig }) {

    netlifyConfig.redirects.push(...stubRedirects())
    stubSkeleton()
    const tmprd = await stubActor()
    netlifyConfig.redirects.push(...tmprd)

    // Add headers
    netlifyConfig.headers.push({
        for: '/u/*',
        values: { 'Content-Type': "application/activity+json" },
      },
      {
        for: '/.well-known/webfinger',
        values: {
          'Content-Type': "application/jrd+json",
          'Access-Control-Allow-Origin': "*",
      },
    })

}


