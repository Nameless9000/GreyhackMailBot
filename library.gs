globals.C = {"g":"<color=green>","r":"<color=red>","G":"<color=#3f3e40>","o":"<color=orange>","p":"<color=purple>","rr":"<color=#FF2222>","lc":"<color=#e0ffff>","e":"</color>","w":"<color=white>","lb":"<color=#25B7DD53>","db":"<color=#209399FF>","c":"<color=#04CBCD>","y":"<color=#F8EB64>"}
globals.t={"bd":C.r,"t":C.o,"p":C.y,"c":C.lc,"o":C.G,"root":C.rr,"user":C.g,"guest":C.p,"other":C.lb,"i":C.e,"s":C.g,"e":C.rr,"it":C.o,"pa":C.o,"ip":C.c}
globals.disable_print = false
uma = user_mail_address

Bot = {}
Bot.Commands = {}

Bot.config = {}

Bot.config.email = ""
Bot.config.password = ""
Bot.config.libmail = "/lib/libmail.so"
Bot.config.metamail = null
Bot.config.whitelist = {}

com = get_shell.host_computer

Error = function(message)
    es = C.r+"Error: "+message+"."+C.e
    print(es)
    return es
end function

Bot.generateMetamail = function()
    f = com.File(self.config.libmail)
    if f then
        LibMail = include_lib(f.path)

        mail = LibMail.login(self.config.email, self.config.password)

        if typeof(mail) == "string" then
            return Error(mail)
        else
            return mail
        end if
    else
        return Error("Path to libmail is incorrect")
    end if
end function

Bot.addToWhitelist = function(email, permissions)
    self.config.whitelist[email] = permissions
end function

Bot.sendRawEmail = function(email, subject, message)
    if globals.disable_print == true then return

    if not self.config.metamail then
        self.config.metamail = self.generateMetamail()
        if not self.config.metamail then return
    end if

    return self.config.metamail.send(email, subject, message)
end function

Bot.getMailList = function()
    if not self.config.metamail then
        self.config.metamail = self.generateMetamail()
        if not self.config.metamail then return
    end if

    return self.config.metamail.fetch()
end function

Bot.sendReply = function(email,message)
    self.sendRawEmail(email,"[BOT] Command Response",message)
    return message
end function

Bot.parseCommand = function(sender,message)
    // bad and old code from my hacking tool modified to work for this lol
    globals.disable_print = false

    cmds = message.split(";")
    if cmds.len == 0 then cmds.push(message)

    for cmd in cmds
        pipes = cmd.split(":")
        if pipes.len == 0 then pipes.push(cmd)
        globals.lout = null

        cpipe = 1
        for pipe in pipes
            globals.disable_print = true
            if cpipe == pipes.len then
                globals.disable_print = false
            else
                cpipe=cpipe+1
            end if

            args = pipe.split(" ")
            cmdn = args[0].lower

            args.pull
            if self.Commands.hasIndex(cmdn) then
                cmd = self.Commands[cmdn]
                Args = cmd.Args.trim.replace("(opt) ","(opt)").split(" ")

                usa = function()
                    msg = t.c+ cmd.Name+" "+t.p+" "+cmd.Args.trim +t.c+" -> "+t.t+ cmd.Description
                    
                    self.sendReply(sender,"Usage: "+msg)
                    globals.lout = null
                end function

                if cmd.Args.trim == "" then
                    if args.len == 1 then
                        if args[0] == "-h" or args[0] == "--help" then
                            usa
                            continue
                        end if
                    end if
                    globals.lout = cmd.Run(sender,args,globals.lout)
                    continue
                end if

                ta=0
                oa=0
                ra=0
                for arg in Args
                    arg=arg.replace("[","")
                    arg=arg.replace("]","")

                    if arg.indexOf("(opt)") == 0 then
                        oa=oa+1
                    else
                        ra=ra+1
                    end if
                    ta=ta+1
                end for
                
                if globals.lout != null then
                    if ra == 1 and args.len < ra then
                        args.push(globals.lout)
                    end if
                    ra=ra-1
                    oa=oa+1
                end if
                
                if (args.len < ra or args.len > ta) then
                    usa
                else
                    if args.len == 1 then
                        if args[0] == "-h" or args[0] == "--help" then
                            usa
                            continue
                        end if
                    end if
                    globals.lout = cmd.Run(sender,args,globals.lout)
                end if
            else
                self.sendReply(sender, Error("Command not found"))
            end if
        end for
    end for
end function

Bot.start = function()
    print("Scanning mailbox...")

    if not self.config.metamail then
        self.config.metamail = self.generateMetamail()
        if not self.config.metamail then return
    end if

    for mail in self.getMailList()
        mail = mail.split("\n")
        mail.pull
        mail.pull

        MailID = ""
        Sender = ""
        Subject = ""
        Content = ""

        for data in mail
            data = data.split(": ")

            if data.len > 1 then
                if data[0] == "MailID" then MailID = data[1]
                if data[0] == "From" then Sender = data[1]
                if data[0] == "Subject" then Subject = data[1]
            else
                Content = data[0]
            end if
        end for

        if Subject.indexOf("[BOT]") == 0 then continue

        print("Found: "+MailID+":"+Sender)

        self.parseCommand(Sender, Content)

        self.config.metamail.delete(MailID)
    end for
    wait(2.5)
    self.start()
end function

// DEFAULT COMMANDS

Bot.Commands["help"] = {"Name":"help", "Description":"List all commands.", "Args":""}
Bot.Commands["help"]["Run"] = function(sender,args,pipe)
    Ret = "<size=0>\n</size>"+C.g+"Commands:"+C.e+"<size=0>\n</size>"

	for Command in Bot.Commands
		CData = Command.value
		Ret = Ret+"		"+C.lc+ CData.Name +C.y+" "+ CData.Args.trim +C.lc+" -> "+C.o+ CData.Description+"<size=0>\n</size>"
	end for

	return Bot.sendReply(sender, Ret)
end function

Bot.Commands["echo"] = {"Name": "echo","Description": "Prints text.","Args": "[text]"}
Bot.Commands["echo"]["Run"] = function(sender,args,pipe)
	if pipe then args.push(pipe)
	text = args.join(" ")
	return Bot.sendReply(sender, text)
end function

return Bot
