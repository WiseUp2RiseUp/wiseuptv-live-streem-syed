$("#updateNews").click(function () {
  news.headline1 = $("#headline1").val();
  news.headline2 = $("#headline2").val();
  news.headline3 = $("#headline3").val();
  news.headline4 = $("#headline4").val();
  news.headline5 = $("#headline5").val();
  let r = confirm("Are you sure you want to update the news?");
  if (r) {
    sendMsg(JSON.stringify(news), "newsUpdate");
  }
});
