module.exports = function blockLevelOneWhispers(dispatch) {
  var name;
  var gameId;
  var serverId;
  var whisperQueues = {};
  var debug = false;
  var HiddenName;
  
  dispatch.hook('S_LOGIN', 15, (event) => {
    ({name, gameId, serverId} = event);
  });

  dispatch.hook('S_WHISPER', 4, (event) => {
    if(event.name !== name) {
      if(!(whisperQueues[event.name]))
        whisperQueues[event.name] = [];
		whisperQueues[event.name].push(event.message);
		dispatch.toServer('C_ASK_INTERACTIVE', 2, {
			unk1: 1,
			serverId: event.senderServerId,
			name: event.name
		});
      return false;
    }
  });

  dispatch.hook('S_ANSWER_INTERACTIVE', 3, (event) => {
		if(whisperQueues[event.name] && whisperQueues[event.name].length > 0){
		  if(event.level > 19) {
			while(whisperQueues[event.name].length > 0) {
			  dispatch.toClient('S_WHISPER', 4, {
				gameId: gameId,
				senderServerId : event.serverId,
				recipientServerId : serverId,
				isWorldEventTarget: false,
				gm: false,
				founder: false,
				name: event.name,
				recipient: name,
				message: whisperQueues[event.name].shift()
			  });
			}
		  }
		  else {
			while(whisperQueues[event.name].length > 0) {
			  whisperQueues[event.name].shift();
			  console.log("Blocked whisper by : " + event.name)
			}
		  }
		}
  });
}