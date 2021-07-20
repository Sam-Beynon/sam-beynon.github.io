---
layout: post
title: Setting up a .NET core development environment on Ubuntu.
---

My first actual blog post, I feel good about finally starting this off, I guess we'll see how it goes after a while and whether I actually continue with it or not! Anyway, enough about the boring stuff, let's crack on with why I'm here, Umbraco 9 has been released in release candidate and I'm excited about it! A friend of mine was tinkering with trying to get .NET core working on his new laptop in Ubuntu and it inspired me to try it with Umbraco 9 although I was also entirely hoping to gain some experience with just generally building .NET core apps on Linux distributions, however, I'm far too lazy to dual boot and historically with the technologies I've worked with I've just had an easier time on Windows, so my first step was to build an Ubuntu VM which I did using VirtualBox.

As this is more of an aside than an actual part of this guide, I'll just give some basic information as to what I provisioned the VM with, the details of which are as follows.

* Access to 1 CPU Core
* 4096MB RAM
* A modest 20GB of my SSD for storage space. (Fixed size)
* Ubuntu 20.04.2.0 LTS (https://ubuntu.com/download/desktop)

Now that I have my Ubuntu VM all up and running, I can move onto the more fun stuff, configuring the environment for .NET core development. Firstly, I had to install the .NET Core SDK which turned out to be a rather simple affair thanks to the rather well documented process laid out in the Microsoft docs (https://docs.microsoft.com/en-gb/dotnet/core/install/linux-ubuntu#2004-) so, we start off by running the commands, which set the Microsoft package signing key as a trusted key.
```
wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
```

[Image here]

Once these have been successful, you now need to actually install the .NET Core SDK itself, so I crack on with the following commands.

```
sudo apt-get update
sudo apt-get install -y apt-transport-https
sudo apt-get update
sudo apt-get install -y dotnet-sdk-5.0
```

[Image here]

I now have the .NET core SDK installed on my Linux environment, which means I can push on and get VS Code installed, now I have a couple of choices here, I can use something that I keep reading about that's called snap, or I can do it the old fashioned way using apt, I'll opt to use snap today as it's a new experience for me, whenever I have used Ubuntu in the past I did everything with apt, but a one line command just makes me happy! Although I'm sure there are sufficient reasons for using apt over snap for a lot of the Ubuntu community, anyway I pressed on and ran the following command to install VS Code.

```
```

[Image here]


Installing VS Code on linux

Installing the neccessary extensions for VS Code.

Creating a basic console application.

Creating a basic mvc/web application

Installing MSSQL Server on linux.

Building umbraco 9.
