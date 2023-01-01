# hello-activitypub
Are we 
 [ActivityPub](https://www.w3.org/TR/activitypub/)
 yet?

<a href="https://app.netlify.com/start/deploy?repository=https://github.com/shrmpy/hello-activitypub">
    <img src="https://www.netlify.com/img/deploy/button.svg"/></a>

#### Template Key Pair
This template repo re/generates its public and private key pair. To keep the key pair:
- you can modify the local build plugin
- you can disable Netlify auto deploy 

### Requirements
- Netlify account
- Discord webhook (OPTIONAL)

### Quickstart
0. You should have a GitHub/GitLab account
1. Think of a username for your *instance*
2. (OPTIONAL) obtain a [webhook for your Discord server](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks)
3. Click the Netlify quick deploy button above
4. Choose the OAuth provider that you use (see **step#0**)
5. After agreeing to the permissions that Netlify will be granted, you will have 3 fields
6. Field SELF_ACTOR is for the username you chose (see **step#1**)
7. Field DISCORD_WEBHOOK is for the optional webhook you created (see **step#2**)
8. Field GITHUB_AVATAR is for the optional URL of your GitHub profile
9. Click the button to continue, and Netlify should deploy and make a random site name (adjective-noun-NNNN.netlify.app)
10. If your webhook was configured for **step#7**, there should be a message delivered with the link to the new private key PEM 
11. Check that the webfinger file is responding by visiting webfinger.net and searching for your *username@site-name*
12. In the webfinger response, you can find the actor URL of the form `https://site-name/u/username`
13. Check that the actor URL is responding with JSON that contains properties for the inbox URL
14. Navigate to the Functions page of the Netlify dashboard, and choose the `inbox`
15. Check that a follow activity works by manually creating the request, start a terminal:

```
vi examples/subscribe.go
go build -o testsub examples/subscribe.go
testsub -priv $PWD/private-key.pem
```

16. Look at the real time log output in the Functions page, and it should show the Accept activity returned by the remote instance that we subscribed-to
17. Verify by visiting the instance subscribed-to and searching for *username@site-name*
18. To clean up, you can make a Undo activity by using the `examples/unsubscribe.go`



## Credits
Honk
  by [Ted Unangst](https://humungus.tedunangst.com/r/honk) ([LICENSE](https://humungus.tedunangst.com/r/honk/v/tip/f/LICENSE))

Kotori Netlify
  by [Musakai](https://github.com/musakui/kotori-netlify) ([LICENSE](https://github.com/musakui/kotori/blob/omo/LICENSE))

Add ActivityPub Follows to Blog
  by [Tom MacWright](https://macwright.com/2022/12/09/activitypub.html)

Mastodon 6 files
  by [Justin Garrison](https://github.com/rothgar/static-mastodon/) ([LICENSE](https://github.com/rothgar/static-mastodon/blob/main/LICENSE))

Reference AP Inbox
  by [Darius Kazemi](https://github.com/dariusk/express-activitypub) ([LICENSE](https://github.com/dariusk/express-activitypub/blob/master/LICENSE-MIT))

Basic AP Server
  by [Eugen Rochko](https://blog.joinmastodon.org/2018/06/how-to-implement-a-basic-activitypub-server/)

AP Inbox
  by [Eugen Rochko](https://blog.joinmastodon.org/2018/07/how-to-make-friends-and-verify-requests/)

