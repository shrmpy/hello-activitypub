import { stubRedirects, stubSkeleton, stubHeaders } from './formatters.js'
import { stubActor } from './keypair.js'

export const onPreBuild = async function({ netlifyConfig }) {
    netlifyConfig.redirects.push(...stubRedirects())
    stubSkeleton()
    const tmprd = await stubActor()
    netlifyConfig.redirects.push(...tmprd)
    netlifyConfig.headers.push(...stubHeaders())
}

export const onBuild = async function({ constants, utils: { functions, run }}) {
    //await functions.add('./netlify/functions')
    //TODO can we package function src files and copy into the build base dir?
    //     it's not clear, so just call go-install and assume files exist (cmd/*)
    const bin = constants.FUNCTIONS_DIST
    await run.command('GOBIN=' + bin.concat(' go install ./...'))
}


