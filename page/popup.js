//emoji Click Event function
function ClickEmoji(){
    //현재 copyArea에 있는 value를 가져오고 그 뒤에 클릭한 이모지를 덧붙임
    var currentCopy = $("#copyArea").val();
    var newCopy = currentCopy + this.innerHTML;
    $("#copyArea").attr('value', newCopy);

    // chrome storage에 최근 사용한 emoji 저장
    /*
    수정 보완 필요
    처음 앱을 시작하면 최근 이모지에 undifined라고 뜨고
    최근 이모지가 하나밖에 저장안됨
    */
    newEmoji = this.innerHTML;
    chrome.storage.sync.set({'user': newEmoji}, function() { 
        loadEmoji(newEmoji, "#useEmojiList")
    });
    /*
    copyArea에 텍스트를 입력하면 클릭한 이모지가 덧붙여지지 않는 버그발생
    clickEvent는 실행이 되는데 덧붙여지지 않음
    */
}



//copy Emoji in copyArea
function ClickCopy(){
    var text = $("#copyArea").val();
    /*
    execCommand 지원 중단(2015년 4월)
    text.select();
    document.execCommand("copy");
    */
    copyTextToClipboard(text);
}

//copy to the clipboard start
function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
  
    document.body.removeChild(textArea);
  }
function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(function() {
      console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
  }
//copy to the clipboard end

//search in emoji
function ClickSearch(){
    $("#emojiList").children('div').remove();
    var searchText = $("#searchArea").val();
    //이모지 데이터베이스(json)을 불러옴
    $.getJSON('../data/emoji.json', function(data) {
        //json의 요소를 하나씩 탐색
        $.each(data, function(entryIndex, entry) {
            /*
            검색속도 향상을 위해서는 mean을 배열로 구분하지말고
            '/'문자(혹은 다른 구분자) 통해 구분하여 하나의 문자로 만든 후
            정규식을 통해 비교하면 더욱 빠르게 비교 가능할 것 같음
            */
            $.each(entry.mean, function(index, mean){
                if(mean == searchText){
                    loadEmoji(entry.icon, "#emojiList");
                }
            });
        });
    });
}

//find category
function ClickCategory(){
    var category = this.id
    $("#emojiList").children('div').remove();
    $.getJSON('../data/emoji.json', function(data) {
        $.each(data, function(entryIndex, entry) {
            if(entry.category == category || category == "all"){
                loadEmoji(entry.icon, "#emojiList");
            }
        });
    });
}

//load all emoji
function loadEmoji(icon, id){
    var box = document.createElement("div");
    var node = document.createTextNode(icon);
    box.appendChild(node);
    box.addEventListener("click", ClickEmoji);
    $(box).css('float', 'left');
    var elementId = id;
    $(elementId).append(box);
}

$("document").ready(function(){
    chrome.storage.sync.get(['user'], function(result) {
        loadEmoji(result.user, "#useEmojiList");
    });

    //이모지 데이터베이스(json)을 불러옴
    $.getJSON('../data/emoji.json', function(data) {
        //json의 요소를 하나씩 탐색
        $.each(data, function(entryIndex, entry) {
            loadEmoji(entry.icon, "#emojiList");
        });
    });

    $("#copyBtn").on("click", ClickCopy);
    $("#searchBtn").on("click", ClickSearch);
    var nav = $('ul').children();
    $.each(nav, function(index, element){
        $(element).on("click", ClickCategory);
    });
});