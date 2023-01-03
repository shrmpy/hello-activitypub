import { stubRedirects, stubSkeleton, stubHeaders } from './formatters.js'
import { stubActor } from './keypair.js'

export const onPreBuild = async function({ netlifyConfig }) {

    netlifyConfig.redirects.push(...stubRedirects())
    stubSkeleton()
    const tmprd = await stubActor()
    netlifyConfig.redirects.push(...tmprd)
    netlifyConfig.headers.push(...stubHeaders())


}


