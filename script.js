//"It was very fun to play for a very long time. It managed to keep me playing for a couple of days!" -My google review for the original Mine Clicker from 2014
window.isDevVersion = window.location.href.indexOf('demonin.com') == -1

function reset() {
	game = {
		cash: 0,
		XP: 0,
		level: 1,
		baseDamage: 1,
		damage: 1,
		lastSave: Date.now(),
		lastVisualUpdate: Date.now(),
		totalOresMined: 0,
		timePlayed: 0,
		numberFormat: "standard",
		messages: true,
		messages: true,
		unlockedOres: 1,
		currentTool: 1,
		upgradesBought: [0, 0, 0, 0, 0, 0],
		upgradeCosts: [100, 10000, 200000, 2e6, 1e12, 2e13],
		artifacts: 0,
		artifactChance: 5,
		artifactBoost: 0,
		ascensionPoints: 0,
		gameFinished: false,
	}
}

reset()

var currentOre = 1
var currentLayer = 1
var previousLayer = 1
var currentHitPoints = 1
var selectedUpgrade = 0
var messageTime = 0

//If the user confirms the hard reset, resets all variables, saves and refreshes the page
function hardReset() {
  if (confirm("Are you sure you want to reset? You will lose everything!")) {
    reset()
    save()
    location.reload()
  }
}

function save() {
  //console.log("saving")
  game.lastSave = Date.now();
  localStorage.setItem("mineClickerSave", JSON.stringify(game));
  localStorage.setItem("mineClickerLastSaved", game.lastSave);
}
if (!window.isDevVersion) setInterval(save, 5000)

function load() {
	reset()
	let loadgame = JSON.parse(localStorage.getItem("mineClickerSave"))
	if (loadgame != null) {loadGame(loadgame)}
	//mainLoop = function() {
  //  updateVisuals();
  //  requestAnimationFrame(mainLoop);
  //};
  //requestAnimationFrame(mainLoop)
}

load()

function exportGame() {
  save()
  navigator.clipboard.writeText(btoa(JSON.stringify(game))).then(function() {
    alert("Copied to clipboard!")
  }, function() {
    alert("Error copying to clipboard, try again...")
  });
}

function importGame() {
  loadgame = JSON.parse(atob(prompt("Input your save here:")))
  if (loadgame && loadgame != null && loadgame != "") {
    reset()
    loadGame(loadgame)
    save()
		location.reload()
  }
  else {
    alert("Invalid input.")
  }
}

function loadGame(loadgame) {
  // Sets each variable in 'game' to the equivalent variable in 'loadgame' (the saved file)
	let loadKeys = Object.keys(loadgame);
	for (let i = 0; i < loadKeys.length; i++) {
		if (loadgame[loadKeys[i]] !== undefined) {
			let thisKey = loadKeys[i];
			if (Array.isArray(loadgame[thisKey])) {
				// If the item is an array, iterate through the array and set each element individually
				for (let j = 0; j < loadgame[thisKey].length; j++) {
					game[thisKey][j] = loadgame[thisKey][j];
				}
			}
			else {
				game[thisKey] = loadgame[thisKey];
			}
		}
	}
	
	game.level = XPToLevel(Math.max(Math.floor(game.XP), 0))
	document.getElementById("level").innerHTML = game.level
	let XPToNextLevel = levelToXP(game.level + 1) - levelToXP(game.level)
	let ProgressToNextLevel = (game.XP - levelToXP(game.level)).toFixed(1)
	document.getElementById("XPBar").style.width = (ProgressToNextLevel / XPToNextLevel * 100) + "%"
	document.getElementById("cash").innerHTML = "$" + format(game.cash)
	if (game.currentTool < 25) {
		document.getElementById("toolIcon").style.backgroundImage = "url('toolIcons/" + game.currentTool + ".png')"
	}
	else {
		document.getElementById("toolIcon").style.backgroundImage = "url('toolIcons/25.png')"
	}
	if (game.numberFormat == "standard") {
		document.getElementById("numberFormat").innerHTML = "Standard long"
	}
	else if (game.numberFormat == "standardLong") {
		document.getElementById("numberFormat").innerHTML = "Scientific"
	}
	else {
		document.getElementById("numberFormat").innerHTML = "Standard"
	}
	document.getElementById("topBarMessages").innerHTML = game.messages ? "On" : "Off"
}

function format(x,forceLargeFormat=false) {
	if (x==Infinity) {return "Infinity"}
	else if (game.numberFormat == "standard" && (forceLargeFormat || x>=1e12)) {
		let exponent = Math.floor(Math.log10(x) / 3)
		return (x/(1000**exponent)).toFixed(2) + illionsShort[exponent-1]
	}
	else if (game.numberFormat == "standardLong" && (forceLargeFormat || x>=1e12)) {
		let exponent = Math.floor(Math.log10(x) / 3)
		return (x/(1000**exponent)).toFixed(2) + " " + illions[exponent-1]
	}
	else if (game.numberFormat == "scientific" && (forceLargeFormat || x>=1e12)) {
		let exponent = Math.floor(Math.log10(x))
		return (Math.floor(x/(10**exponent)*100)/100).toFixed(2) + "e" + exponent
	}
	else {return Math.floor(x).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
}

function changeNumberFormat() {
	if (game.numberFormat == "standard") {
		game.numberFormat = "standardLong"
		document.getElementById("numberFormat").innerHTML = "Standard long"
	}
	else if (game.numberFormat == "standardLong") {
		game.numberFormat = "scientific"
		document.getElementById("numberFormat").innerHTML = "Scientific"
	}
	else {
		game.numberFormat = "standard"
		document.getElementById("numberFormat").innerHTML = "Standard"
	}
	loadOre(currentOre)
	document.getElementById("cash").innerHTML = "$" + format(game.cash)
}

function loadOre(x) {
	if (x<78) {document.getElementById("oreIcon").style.filter = "drop-shadow(0 0 1vh #222)"}
	else {document.getElementById("oreIcon").style.filter = "none"}
	if (x<79) {
		document.getElementById("oreIcon").style.backgroundImage = "url('oreIcons/" + x + ".png')"
		document.getElementById("oreName").innerHTML = oreNames[x-1]
		if (oreNames[x-1].length > 13) {document.getElementById("oreName").style.fontSize = "5vh"}
		else {document.getElementById("oreName").style.fontSize = "7vh"}
		currentHitPoints = oreHitPoints[x-1]
		document.getElementById("currentOreValue").innerHTML = "$" + format(oreValues[currentOre-1])
		document.getElementById("currentHitPoints").innerHTML = format(currentHitPoints)
		document.getElementById("currentHardness").innerHTML = format(oreHardnesses[currentOre-1])
		if (game.damage - oreHardnesses[currentOre-1] <= 0) {
		document.getElementById("currentDamage").innerHTML = "0"
		document.getElementById("currentDamage").style.color = "#f44"
		}
		else {
			document.getElementById("currentDamage").innerHTML = format(game.damage - oreHardnesses[currentOre-1])
			document.getElementById("currentDamage").style.color = "white"
		}
	}
	else {
		document.getElementById("oreIcon").style.backgroundImage = "url('oreIcons/78.png')"
		document.getElementById("oreName").innerHTML = "Transcendence " + romanize(x-77)
		document.getElementById("oreName").style.fontSize = "5vh"
		currentHitPoints = 1.5**(x-78)*2.5e14
		document.getElementById("currentOreValue").innerHTML = "$" + format(1.8**(x-78)*8e17)
		document.getElementById("currentHitPoints").innerHTML = format(1.5**(x-78)*2.5e14)
		document.getElementById("currentHardness").innerHTML = format(1.5**(x-78)*5e12)
		if (game.damage - 1.5**(x-78)*5e12 <= 0) {
			document.getElementById("currentDamage").innerHTML = "0"
			document.getElementById("currentDamage").style.color = "#f44"
		}
		else {
			document.getElementById("currentDamage").innerHTML = format(game.damage - 1.5**(x-78)*5e12)
			document.getElementById("currentDamage").style.color = "white"
		}
	}
	currentLayer = 1
	while (x>=layerPoints[currentLayer]) currentLayer++
	document.getElementById("main").style.backgroundImage = "url('texture" + currentLayer + ".png')"
	if (currentLayer != previousLayer) {
		setMessage(0,"Now entering: " + layerNames[currentLayer-1])
		previousLayer = currentLayer
	}
	
	if (x==1) {
		document.getElementById("arrowLeft").style.display = "none"
		document.getElementById("arrowSkipLeft").style.display = "none"
	}
	else {
		document.getElementById("arrowLeft").style.display = "block"
		document.getElementById("arrowSkipLeft").style.display = "block"
	}
	if (x>=game.unlockedOres) {
		document.getElementById("arrowRight").style.display = "none"
		document.getElementById("arrowSkipRight").style.display = "none"
	}
	else {
		document.getElementById("arrowRight").style.display = "block"
		document.getElementById("arrowSkipRight").style.display = "block"
	}
}

loadOre(1)

function nextOre() {
	currentOre++
	loadOre(currentOre)
}

function previousOre() {
	currentOre = Math.max(currentOre-1, 1)
	loadOre(currentOre)
}

function firstOre() {
	currentLayer = 1
	while ((currentOre-1)>=layerPoints[currentLayer]) currentLayer++
	currentOre = layerPoints[currentLayer-1]
	loadOre(currentOre)
}

function lastOre() {
	currentLayer = 1
	while (currentOre>=layerPoints[currentLayer]) currentLayer++
	if (layerPoints[currentLayer] > game.unlockedOres) {
		currentOre = game.unlockedOres
		loadOre(currentOre)
	}
	else {
		currentOre = layerPoints[currentLayer]
		loadOre(currentOre)
	}
}

function calculateDamage() {
	if (game.currentTool < 33) {game.baseDamage = toolDamages[game.currentTool-1]}
	else {game.baseDamage = 1.8**(game.currentTool-33)*1.2e9}
	game.damage = game.baseDamage * ((0.08 * (game.upgradesBought[0] ** 1.5) + 1))
	if (game.level >= 10) game.damage = game.damage * (1 + game.artifactBoost / 100)
	if (game.level >= 100) game.damage = game.damage * (1 + game.ascensionPoints / 100)
	game.damage = Math.round(game.damage)
}

function mineOre() {
	if (currentOre<79) {currentHitPoints -= Math.max(game.damage - oreHardnesses[currentOre-1], 0)}
	else {currentHitPoints -= Math.max(game.damage - Math.floor(1.5**(currentOre-78)*5e12), 0)}
	if (currentHitPoints <= 0) {
		if (currentOre<79) {currentHitPoints = oreHitPoints[currentOre-1]}
		else {currentHitPoints = 1.5**(currentOre-78)*2.5e14}
		if (game.level >= 30 && Math.random() * 100 < Math.min(game.upgradesBought[3] ** 0.5 * 15, 100)) {
			if (currentOre<79) {game.cash += oreValues[currentOre-1] * 2}
			else {game.cash += Math.floor(1.8**(currentOre-78)*8e17) * 2}
			setMessage(2,"Double cash!")
		}
		else {
			if (currentOre<79) {game.cash += oreValues[currentOre-1]}
			else {game.cash += Math.floor(1.8**(currentOre-78)*8e17)}
		}
		game.totalOresMined++
		moneyGreen()
		document.getElementById("cash").innerHTML = "$" + format(game.cash)
		game.XP += 1.2 ** (currentOre-1) / 1.3
		game.level = XPToLevel(Math.max(Math.floor(game.XP), 0))
		document.getElementById("level").innerHTML = format(game.level)
		let XPToNextLevel = levelToXP(game.level + 1) - levelToXP(game.level)
		let ProgressToNextLevel = (game.XP - levelToXP(game.level)).toFixed(1)
		document.getElementById("XPBar").style.width = (ProgressToNextLevel / XPToNextLevel * 100) + "%"
		if (currentOre == game.unlockedOres) {
			game.unlockedOres++
			if (game.level >= 10) {
				game.artifacts++
				setMessage(1,"Found an artifact!")
			}
			document.getElementById("arrowRight").style.display = "block"
			document.getElementById("arrowSkipRight").style.display = "block"
		}
		else if (game.level >= 10 && Math.random() < (game.artifactChance / 100)) {
			game.artifacts++
			setMessage(1,"Found an artifact!")
		}
		if (currentOre == 78 && !game.gameFinished) {
			document.getElementById("gameFinishScreen").style.display = "block"
			game.gameFinished = true
		}
	}
	document.getElementById("currentHitPoints").innerHTML = format(currentHitPoints)
}

function moneyGreen() {
	document.getElementById("cash").style.transition = "none"
	document.getElementById("cash").style.color = "#8f8"
	setTimeout(function() {
		document.getElementById("cash").style.transition = "color 500ms"
	document.getElementById("cash").style.color = "white"
	}, 200)
}

function XPToLevel(x) {return Math.floor((x/5) ** 0.4) + 1} 
function levelToXP(x) {return Math.ceil((x - 1) ** (1/0.4) * 5)} 
function levelToColour(x) {
	colour = Math.floor(((x-1) ** 0.5) * 50) % 960
	stage = Math.ceil((colour + 1) / 160)
	if (stage == 1) {return "#c0" + (32 + colour).toString(16) + "20"} //Red to yellow
	else if (stage == 2) {return "#" + (192 - (colour - 160)).toString(16) + "c020"} //Yellow to green
	else if (stage == 3) {return "#20c0" + (32 + (colour - 320)).toString(16)} //Green to light blue
	else if (stage == 4) {return "#20" + (192 - (colour - 480)).toString(16) + "c0"} //Light blue to dark blue
	else if (stage == 5) {return "#" + (32 + (colour - 640)).toString(16) + "20c0"} //Dark blue to pink
	else if (stage == 6) {return "#c020" + (192 - (colour - 800)).toString(16)} //Pink to red
}

function enableDisableMessages() {
	game.messages = !game.messages
	document.getElementById("topBarMessages").innerHTML = game.messages ? "On" : "Off"
}

function setMessage(x,y) {
	let messageColours = ["#8f8", "#ff8", "#8ff"]
	if (game.messages) {
		document.getElementById("message").style.color = messageColours[x]
		document.getElementById("message").innerHTML = y
		messageTime = 2.5
	}
}

function updateVisuals() {
	if (messageTime == 0) {
		document.getElementById("sectionMessages").style.display = "none"
	}
	else if (messageTime < 1) {
		document.getElementById("sectionMessages").style.display = "block"
		document.getElementById("sectionMessages").style.opacity = messageTime
	}
	else {
		document.getElementById("sectionMessages").style.display = "block"
		document.getElementById("sectionMessages").style.opacity = "1"
	}
	let timeDivider = 1 / (Date.now() - game.lastVisualUpdate)
	if (messageTime > 0) messageTime -= timeDivider
	if (messageTime < 0) messageTime = 0
	game.lastVisualUpdate = Date.now()
}

setInterval(updateVisuals, 16)

function openToolScreen() {
	document.getElementById("toolScreen").style.left = "0"
	document.getElementById("upgradeScreen").style.left = "-100%"
	document.getElementById("statsScreen").style.left = "-100%"
	loadToolScreenInfo()
}

function loadToolScreenInfo() {
	if (game.currentTool < 25) {
		document.getElementById("currentTool").innerHTML = toolNames[game.currentTool-1]
		if (toolNames[game.currentTool-1].length > 13) {document.getElementById("currentTool").style.fontSize = "6vh"}
		else {document.getElementById("currentTool").style.fontSize = "8vh"}
		document.getElementById("toolIconLarge").style.backgroundImage = "url('toolIcons/" + game.currentTool + ".png')"
	}
	else {
		document.getElementById("currentTool").innerHTML = "Devourer Mk. " + romanize(game.currentTool - 24)
		if (("Devourer Mk. " + romanize(game.currentTool - 24)).length > 13) {document.getElementById("currentTool").style.fontSize = "6vh"}
		else {document.getElementById("currentTool").style.fontSize = "8vh"}
		document.getElementById("toolIconLarge").style.backgroundImage = "url('toolIcons/25.png')"
	}
	if (game.currentTool < 24) {document.getElementById("nextTool").innerHTML = toolNames[game.currentTool]}
	else {document.getElementById("nextTool").innerHTML = "Devourer Mk. " + romanize(game.currentTool - 23)}
	if (toolDamages[game.currentTool] < 1e6) {document.getElementById("nextDamage").innerHTML = "Damage: " + format(toolDamages[game.currentTool-1]) + " -> " + format(toolDamages[game.currentTool])}
	else if (game.currentTool < 33) {document.getElementById("nextDamage").innerHTML = format(toolDamages[game.currentTool-1]) + " -> " + format(toolDamages[game.currentTool])}
	else {document.getElementById("nextDamage").innerHTML = format(1.8**(game.currentTool-33)*1.2e9,true) + " -> " + format(1.8**(game.currentTool-32)*1.2e9,true)}
	if (game.currentTool < 33) {document.getElementById("nextToolCost").innerHTML = "$" + format(toolCosts[game.currentTool-1]*(0.8 ** (game.upgradesBought[5] ** 0.8)))}
	else {document.getElementById("nextToolCost").innerHTML = "$" + format(((1+game.currentTool/10)**(game.currentTool-32)*2e19)*(0.8 ** (game.upgradesBought[5] ** 0.8)))}
	document.getElementById("toolScreenCash").innerHTML = "$" + format(game.cash)
	if (game.level >= 10) {
		document.getElementById("artifactBottomButton").style.color = "#860"
		document.getElementById("artifactBottomButton").innerHTML = "Artifacts"
	}
	if (game.level >= 100) {
		document.getElementById("ascensionBottomButton").style.color = "#60a"
		document.getElementById("ascensionBottomButton").innerHTML = "Ascension"
	}
}

function closeToolScreen() {
	document.getElementById("toolScreen").style.left = "100%"
	loadOre(currentOre)
}

function upgradeTool () {
	let toolCost = 0
	if (game.currentTool < 33) {toolCost = toolCosts[game.currentTool-1]}
	else {toolCost = (1+game.currentTool/10)**(game.currentTool-32)*2e19}
	toolCost = toolCost * (0.8 ** (game.upgradesBought[5] ** 0.8))
	if (game.cash >= toolCost) {
		game.cash -= toolCost
		document.getElementById("cash").innerHTML = "$" + format(game.cash)
		game.currentTool++
		game.artifactBoost = 0
		loadToolScreenInfo()
		calculateDamage()
		if (game.currentTool < 25) {
			document.getElementById("toolIcon").style.backgroundImage = "url('toolIcons/" + game.currentTool + ".png')"
		}
		else {
			document.getElementById("toolIcon").style.backgroundImage = "url('toolIcons/25.png')"
		}
	}
}

function openArtifactScreen() {
	if (game.level >= 10) {
		document.getElementById("artifactScreen").style.left = "0"
		document.getElementById("ascensionScreen").style.left = "100%"
		document.getElementById("artifacts").innerHTML = format(game.artifacts)
		document.getElementById("artifactChance").innerHTML = format(game.artifactChance)
		document.getElementById("artifactBoost").innerHTML = format(game.artifactBoost)
		document.getElementById("artifactBoostCap").innerHTML = format(160*(0.08 * (game.upgradesBought[2] ** 1.4) + 1))
		document.getElementById("lastBoost").innerHTML = ""
	}
}

function closeArtifactScreen() {
	document.getElementById("artifactScreen").style.left = "100%"
}

function useArtifact() {
	if (game.artifacts > 0) {
		game.artifacts--
		let upgrade3Effect = 0.08 * (game.upgradesBought[2] ** 1.4) + 1
		let artifactBoost = Math.max((1/(Math.random() ** 0.65)) * (10*upgrade3Effect) - (12*upgrade3Effect), 0)
		if (artifactBoost > (40*upgrade3Effect)) artifactBoost = (artifactBoost * (40*upgrade3Effect)) ** 0.5
		if (artifactBoost > (160*upgrade3Effect)) artifactBoost = (160*upgrade3Effect)
		if (artifactBoost > game.artifactBoost) {
			game.artifactBoost = artifactBoost
			document.getElementById("artifactBoost").innerHTML = format(game.artifactBoost)
			document.getElementById("lastBoost").style.color = "#8f8"
			document.getElementById("lastBoost").innerHTML = "Tool upgraded! (" + format(artifactBoost) + "%)"
			calculateDamage()
		}
		else {
			document.getElementById("lastBoost").style.color = "#bbb"
			document.getElementById("lastBoost").innerHTML = "Not strong enough... (" + format(artifactBoost) + "%)"
		}
		document.getElementById("artifacts").innerHTML = game.artifacts
	}
}

function openAscensionScreen() {
	if (game.level >= 100) {
		document.getElementById("ascensionScreen").style.left = "0"
		document.getElementById("artifactScreen").style.left = "100%"
		document.getElementById("ascensionPoints").innerHTML = format(game.ascensionPoints)
		document.getElementById("ascensionScreenCash").innerHTML = "$" + format(game.cash)
		let ascensionPointsToGet = Math.floor(game.cash ** 0.15 * 3)
		ascensionPointsToGet = ascensionPointsToGet * (0.15 * (game.upgradesBought[4] ** 1.4) + 1)
		ascensionPointsToGet = Math.max(ascensionPointsToGet - game.ascensionPoints, 0)
		document.getElementById("ascensionPointsToGet").innerHTML = format(ascensionPointsToGet)
		let nextAscensionPoint = (game.ascensionPoints + ascensionPointsToGet + 1) / (0.15 * (game.upgradesBought[4] ** 1.4) + 1)
		nextAscensionPoint = Math.floor((nextAscensionPoint / 3) ** (1/0.15))
		document.getElementById("nextAscensionPoint").innerHTML = "$" + format(nextAscensionPoint)
	}
}

function closeAscensionScreen() {
	document.getElementById("ascensionScreen").style.left = "100%"
}

function confirmAscension() {
	document.getElementById("ascensionConfirmation").style.display = "block"
}

function cancelAscension() {
	document.getElementById("ascensionConfirmation").style.display = "none"
}

function ascend() {
	let ascensionPointsToGet = Math.floor(game.cash ** 0.15 * 3)
	ascensionPointsToGet = ascensionPointsToGet * (0.15 * (game.upgradesBought[4] ** 1.4) + 1)
	ascensionPointsToGet = Math.max(ascensionPointsToGet - game.ascensionPoints, 0)
	game.ascensionPoints += ascensionPointsToGet
	currentOre = 1
	game.cash = 0
	game.unlockedOres = 1
	game.currentTool = 1
	game.upgradesBought[0] = 0
	game.upgradesBought[1] = 0
	game.upgradesBought[2] = 0
	game.upgradesBought[3] = 0
	game.upgradeCosts[0] = 100 
	game.upgradeCosts[1] = 10000
	game.upgradeCosts[2] = 200000
	game.upgradeCosts[3] = 2e6
	game.artifacts = 0
	game.artifactChance = 5
	game.artifactBoost = 0
	game.baseDamage = 1
	calculateDamage()
	document.getElementById("ascensionConfirmation").style.display = "none"
	document.getElementById("ascensionScreen").style.left = "100%"
	document.getElementById("toolScreen").style.left = "100%"
	document.getElementById("cash").innerHTML = "$" + format(game.cash)
	document.getElementById("toolIcon").style.backgroundImage = "url('toolIcons/" + game.currentTool + ".png')"
	loadOre(currentOre)
}

function openUpgradeScreen() {
	document.getElementById("upgradeScreen").style.left = "0"
	document.getElementById("toolScreen").style.left = "100%"
	document.getElementById("statsScreen").style.left = "-100%"
	document.getElementById("upgradeScreenCash").innerHTML = "$" + format(game.cash)
	displayUpgrade(selectedUpgrade)
	for (let i=0;i<6;i++) {
		if (game.level < upgradeUnlockLevels[i]) {document.getElementsByClassName("upgrade")[i].style.filter = "invert(30%)"}
		else {document.getElementsByClassName("upgrade")[i].style.filter = "none"}
	}
}

function closeUpgradeScreen() {
	document.getElementById("upgradeScreen").style.left = "-100%"
	loadOre(currentOre)
}

function displayUpgrade(x) {
	if (x==0) {
		document.getElementById("upgradeButton").innerHTML = "<br>Tap an upgrade for info"
	}
	else if (game.level >= upgradeUnlockLevels[x-1]) {
		selectedUpgrade = x
		//Yes I am aware this is kind of messed up
		if (x==1) {document.getElementById("upgradeButton").innerHTML = "Increase damage<br>" + format((0.08 * (game.upgradesBought[0] ** 1.5) + 1) * 100) + "% -> " + format((0.08 * ((game.upgradesBought[0]+1) ** 1.5) + 1) * 100) + "%<br>Costs $" + format(game.upgradeCosts[0])}
		else if (x==2) {document.getElementById("upgradeButton").innerHTML = "Increase artifact drop chance<br>" + format(game.upgradesBought[1]+5) + "% -> " + format(game.upgradesBought[1]+6) + "%<br>Costs $" + format(game.upgradeCosts[1])}
		else if (x==3) {document.getElementById("upgradeButton").innerHTML = "Increase artifact boost<br>" + format((0.08 * (game.upgradesBought[2] ** 1.4) + 1) * 100) + "% -> " + format((0.08 * ((game.upgradesBought[2]+1) ** 1.4) + 1) * 100) + "%<br>Costs $" + format(game.upgradeCosts[2])}
		else if (x==4) {document.getElementById("upgradeButton").innerHTML = "Increase double cash chance<br>" + format(Math.min(game.upgradesBought[3] ** 0.5 * 15, 100)) + "% -> " + format(Math.min((game.upgradesBought[3]+1) ** 0.5 * 15, 100)) + "%<br>Costs $" + format(game.upgradeCosts[3])}
		else if (x==5) {document.getElementById("upgradeButton").innerHTML = "Increase AP gain<br>" + format((0.15 * (game.upgradesBought[4] ** 1.4) + 1) * 100) + "% -> " + format((0.15 * ((game.upgradesBought[4]+1) ** 1.4) + 1) * 100) + "%<br>Costs $" + format(game.upgradeCosts[4])}
		else if (x==6) {document.getElementById("upgradeButton").innerHTML = "Decrease tool upgrade cost<br>" + format(0.8 ** (game.upgradesBought[5] ** 0.8) * 100) + "% -> " + format(0.8 ** ((game.upgradesBought[5]+1) ** 0.8) * 100) + "%<br>Costs $" + format(game.upgradeCosts[5])}
	}
	else {
		selectedUpgrade = 0
		document.getElementById("upgradeButton").innerHTML = "<br>Unlocks at level " + upgradeUnlockLevels[x-1] + "!"
	}
}

function buyUpgrade() {
	if (selectedUpgrade > 0 && game.cash >= game.upgradeCosts[selectedUpgrade-1]) {
		game.cash -= game.upgradeCosts[selectedUpgrade-1]
		document.getElementById("cash").innerHTML = "$" + format(game.cash)
		document.getElementById("upgradeScreenCash").innerHTML = "$" + format(game.cash)
		game.upgradesBought[selectedUpgrade-1]++
		game.upgradeCosts[selectedUpgrade-1] = Math.floor(upgradeBases[selectedUpgrade-1] ** game.upgradesBought[selectedUpgrade-1] * upgradeInitialCosts[selectedUpgrade-1])
		displayUpgrade(selectedUpgrade)
		if (selectedUpgrade==1) calculateDamage()
		else if (selectedUpgrade==2) game.artifactChance = 5 + game.upgradesBought[selectedUpgrade-1]
	}
}

function openStatsScreen() {
	document.getElementById("statsScreen").style.left = "0"
	document.getElementById("toolScreen").style.left = "100%"
	document.getElementById("upgradeScreen").style.left = "-100%"
	document.getElementById("totalOresMined").innerHTML = format(game.totalOresMined)
	if (game.numberFormat == "standard") {document.getElementById("numberFormat").innerHTML = "Standard"}
	else if (game.numberFormat == "standardLong") {document.getElementById("numberFormat").innerHTML = "Standard long"}
	else {document.getElementById("numberFormat").innerHTML = "Scientific"}
}

function closeStatsScreen() {
	document.getElementById("statsScreen").style.left = "-100%"
}

function adjustDivSize() {
    // Get the window's width and height
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;

    // Calculate the aspect ratios
    var aspectRatio = windowWidth / windowHeight;
    var maxAspectRatio = 9/16;

    // Get the divider by its ID
    var div = document.getElementById("main");

    // If the aspect ratio is more than the maximum, adjust the width
    if (aspectRatio > maxAspectRatio) {
      div.style.height = windowHeight + 'px';
      div.style.width = (windowHeight * maxAspectRatio) + 'px';
			for (i=0;i<document.getElementsByClassName("bottomButton").length;i++) document.getElementsByClassName("bottomButton")[i].style.height = (windowHeight * maxAspectRatio * 0.16) + "px" //Bottom buttons
			for (i=0;i<document.getElementsByClassName("bottomButton").length;i++) document.getElementsByClassName("bottomButton")[i].style.lineHeight = (windowHeight * maxAspectRatio * 0.16) + "px" //Bottom buttons
			document.getElementById("toolIcon").style.bottom = (windowHeight * maxAspectRatio * 0.32) + "px"
			document.getElementById("toolIcon").style.height = (windowHeight * maxAspectRatio * 0.16) + "px"
			document.getElementById("toolIcon").style.width = (windowHeight * maxAspectRatio * 0.16) + "px"
			document.getElementById("toolUpgradeButton").style.height = (windowHeight * maxAspectRatio * 0.24) + "px"
			document.getElementById("toolUpgradeButton").style.fontSize = (windowHeight * maxAspectRatio * 0.065) + "px"
			document.getElementById("upgradeButton").style.height = (windowHeight * maxAspectRatio * 0.24) + "px"
			document.getElementById("upgradeButton").style.fontSize = (windowHeight * maxAspectRatio * 0.065) + "px"
			document.getElementById("ascendButton").style.height = (windowHeight * maxAspectRatio * 0.24) + "px"
			document.getElementById("ascendButton").style.fontSize = (windowHeight * maxAspectRatio * 0.065) + "px"
    }
    // Otherwise, use the full window size
    else {
      div.style.width = windowWidth + 'px';
      div.style.height = windowHeight + 'px';
			for (i=0;i<document.getElementsByClassName("bottomButton").length;i++) document.getElementsByClassName("bottomButton")[i].style.height = (windowWidth * 0.16) + "px" //Bottom buttons
			for (i=0;i<document.getElementsByClassName("bottomButton").length;i++) document.getElementsByClassName("bottomButton")[i].style.lineHeight = (windowWidth * 0.16) + "px" //Bottom buttons
			document.getElementById("toolIcon").style.bottom = (windowWidth * 0.32) + "px"
			document.getElementById("toolIcon").style.height = (windowWidth * 0.16) + "px"
			document.getElementById("toolIcon").style.width = (windowWidth * 0.16) + "px"
			document.getElementById("toolUpgradeButton").style.height = (windowWidth * 0.24) + "px"
			document.getElementById("toolUpgradeButton").style.fontSize = (windowWidth * 0.065) + "px"
			document.getElementById("upgradeButton").style.height = (windowWidth * 0.24) + "px"
			document.getElementById("upgradeButton").style.fontSize = (windowWidth * 0.065) + "px"
			document.getElementById("ascendButton").style.height = (windowWidth * 0.24) + "px"
			document.getElementById("ascendButton").style.fontSize = (windowWidth * 0.065) + "px"
    }
}

// Run adjustDivSize initially to set the size on page load
adjustDivSize();

// Attach the function as an event listener to the window resize event
window.addEventListener('resize', adjustDivSize);

function romanize(x) {
	if (isNaN(x))
		return NaN;
	var digits = String(+x).split(""),
		key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
			"","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
			"","I","II","III","IV","V","VI","VII","VIII","IX"],
		roman = "",
		i = 3;
	while (i--)
		roman = (key[+digits.pop() + (i * 10)] || "") + roman;
	return Array(+digits.join("") + 1).join("M") + roman;
}

lastTimePlayedUp = Date.now()
function timePlayedUp() {
	timePlayedDiff = (Date.now() - lastTimePlayedUp) / 1000
	game.timePlayed += timePlayedDiff
	lastTimePlayedUp = Date.now()
	if (document.getElementById("statsScreen").style.left == "0px") {
		let timePlayedFloor = Math.floor(game.timePlayed)
		let timePlayedHours = Math.floor(timePlayedFloor / 3600)
		let timePlayedMinutes = Math.floor(timePlayedFloor / 60) % 60
		let timePlayedSeconds = timePlayedFloor % 60
		let timeString = (timePlayedHours + ":" + ((timePlayedMinutes < 10 ? '0' : '') + timePlayedMinutes) + ":" + ((timePlayedSeconds < 10 ? '0' : '') + timePlayedSeconds))
		document.getElementById("timePlayed").innerHTML = timeString
	}
}

setInterval(timePlayedUp, 100)
