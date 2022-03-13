try {
    if (location.pathname.indexOf("countdown-timer") === -1 && location.pathname.indexOf("bingo") === -1 && location.pathname.indexOf("stopwatch") === -1) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            // 登録されているworkerを全て削除する
            for(let registration of registrations) {
                registration.unregister();
            }
        });
        caches.keys().then(function(keys) {
            var promises = [];
            // キャッシュストレージを全て削除する
            keys.forEach(function(cacheName) {
                  promises.push(caches.delete(cacheName));
                
            });
        });
    }

} catch (e) {
    console.log("No service workers");
}
