# GreyhackMailBot
Why did i spent 4 hours making this...

## How to use:
```lua
import_code("LIBRARY_PATH.src")

email = "admin@domain.com"

b = new Bot

//-- these can be another email if u have one
b.config.email = email
b.config.password = "ur email pass"

//-- coming soon (probably)
b.addToWhitelist(email, 6)

b.start()
```
