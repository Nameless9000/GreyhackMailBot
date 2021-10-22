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

//-- add commands: (read code for more functions if u want them)
b.Commands["test"] = {"Name":"test","Description":"This is a test command.","Args":"[arg1] [(opt) optionalArg2]"} //-- leave args blank if u don't want any
b.Commands["test"]["Run"] = function(sender, args, pipe) //-- sender= email of sender | args = array of args | pipe = the return of piped command
  toSend = args[0]
  if args.len > 1 then toSend=toSend+":"+args[1]
  if pipe then toSend=toSend+":"+pipe
  
  return b.sendReply(sender, toSend)
end function

b.start()
```
