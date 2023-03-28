# symfonyRPG

rougelike webapp created with symfony. 

![image](https://user-images.githubusercontent.com/79169638/228236242-70518116-de83-4cab-a03c-73a41948fa2c.png)

a second shot at an ascii rougelike using what i learned from my first go at this (https://github.com/sqrtM/react-rpg)

## design philosophy. 
what I wanted to create was a theoretically completely infinite plain with randomly generated dungeons and the like. I'm seeing this as almost more of a boardgame design than a rougelike design. Days will pass and enemies will get stronger. the player chooses rather to use their time and resources to search for an exit or to venture deeper and grow more powerful --- perhaps to make future runs easier, granted they can survive.

This isn't a unique idea by any stretch. The way it appeared in my head was more or less "what if there was an game which felt like the late game of DCSS?" and that's more or less what I'm going for. More than anything though, I just love horrifically, extremely unintuitive RPG mechanics, and I've always wanted to put something like that together, hense the multiple status bars and mana types. 

I'm not a game designer and I don't really want to be. This is a creative programming project more than anything and I'm just throwing stuff at the wall to see what sticks for now. 

I've always liked the simplicity of an ASCII rpg, and in general I feel like not enough is done, design wise, with plaintext on webapps. maybe it's my geocities nostalgia, but I feel like there's a lot to explore in the realm of artistic expression with plaintext and css (as many other people, like those at Cohost) are quickly discovering. ASCII games in HTML settings just seem like a no-brainer to me. 

the backend of the project does a surprising amount of heavy lifting. One of the problems I encountered the first time I did this project was that it's actually quite taxing to have someone's web browser load up an array of one million javascript objects which need to constantly be ready to be retrieved at any moment. The solution I found to that was to separate the map out into screens which are called by the user as they traverse the world. I went back and forth a lot as to whether i wanted to keep the old scrolling viewporting style from the original—and maybe I'll come back to that one—but for now, I'm happy with the almost resident evil-style screen-by-screen motion. 

Since the entire world is saved at the user's discretion — including state and location and enemies and status... — this opens the door to allowing other players to enter your world. There are two approaches to this that I'm considering — clash of clans and dark souls. Maybe there's room for both!

In the former camp, perhaps when the user is offline, their world can be "raided" by another player who may come to destroy their facilities and steal their treasures and the like. Perhaps the owner of that world may appear at the location they logged of at as an NPC, ready to fight the raiders on the user's behalf. This would necessitate a certain style of game development in which the construction of fortifications was key to success, almost like a 2D minecraft experience. 

In the latter camp, we could see synconous online multiplayer which could be either competitive or cooperative. I see no reason why this could not, too, be implimented, though, it would certainly necessitate me moving to a higher speed database than the one I am currently using. 

ultimately, I am moving toward the first option, and it's what I've designed most of the architecture around. I like the idea that, after a certain point in the game, the user obtains the ability to visit other world in order to collect resources.
