import { stubRedirects, stubSkeleton, stubHeaders } from './formatters.js'
import { stubActor } from './keypair.js'

export const onPreBuild = async function({ netlifyConfig }) {
    netlifyConfig.redirects.push(...stubRedirects())
    stubSkeleton()
    const tmprd = await stubActor()
    netlifyConfig.redirects.push(...tmprd)
    netlifyConfig.headers.push(...stubHeaders())
}

export const onBuild = async function({ constants, netlifyConfig, utils: { functions, run }}) {
    //TODO can we package function src files and copy into the build base dir?
    //     it's not clear, so just call go-install and assume files exist (cmd/*)
    netlifyConfig.build.environment.GOBIN = constants.FUNCTIONS_SRC
    await run.command('mkdir -p ' + constants.FUNCTIONS_SRC)
    await run.command('go install ./...')
    await functions.add(constants.FUNCTIONS_SRC)
}


