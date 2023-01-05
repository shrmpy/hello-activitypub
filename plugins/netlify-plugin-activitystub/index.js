import { stubRedirects, stubSkeleton, stubHeaders } from './formatters.js'
import { stubActor } from './keypair.js'

export const onPreBuild = async function({ constants, netlifyConfig, utils: { run }}) {
    netlifyConfig.redirects.push(...stubRedirects())
    stubSkeleton()
    // define actor
    const tmprd = await stubActor()
    netlifyConfig.redirects.push(...tmprd)
    // define headers
    netlifyConfig.headers.push(...stubHeaders())
    // make functions
    netlifyConfig.build.environment.GOBIN = constants.FUNCTIONS_SRC
    await run.command('mkdir -p ' + constants.FUNCTIONS_SRC)
    ////await run.command('go install -v -x -a ./...')
    await run.command('go build -o ' + constants.FUNCTIONS_SRC + '/inbox cmd/inbox/*.go')
    await run.command('go build -o ' + constants.FUNCTIONS_SRC + '/sort cmd/sort/*.go')
}

export const onBuild = async function({ constants, netlifyConfig, utils: { functions, run }}) {
    //TODO can we package function src files and copy into the build base dir?
    //     it's not clear, so just call go-install and assume files exist (cmd/*)
    ////await functions.add(constants.FUNCTIONS_SRC)
}


