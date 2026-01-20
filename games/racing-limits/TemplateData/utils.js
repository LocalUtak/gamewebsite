console.log("Racing Limits MSGames");

let interstitial = null;
let rewarded = null;

function loadAds() {
  console.log("[MSDR] Load ads");
  loadInterstitial();
  loadRewarded();
}

function loadInterstitial() {
  interstitial = null;
  $msstart
    .loadAdsAsync()
    .then((adInstance) => {
      interstitial = adInstance;
      console.log("[MSDR] Interstitial ad loaded!");
      gameInstance.SendMessage("SBKMSAds", "OnInterstitialAdLoaded");
    })
    .catch((e) => {
      console.error(
        `[MSDR] Error loading interstitial: ${JSON.stringify(
          e
        )}. Retrying in 15s`
      );
      gameInstance.SendMessage("SBKMSAds", "OnInterstitialAdLoadFailed");
      setTimeout(loadInterstitial, 15000);
    });
}

function loadRewarded() {
  rewarded = null;
  $msstart
    .loadAdsAsync(true)
    .then((adInstance) => {
      rewarded = adInstance;
      console.log("[MSDR] Rewarded ad loaded!");
      gameInstance.SendMessage("SBKMSAds", "OnRewardedAdLoaded");
    })
    .catch((e) => {
      console.error(
        `[MSDR] Error loading rewarded: ${JSON.stringify(e)}. Retrying in 15s`
      );
      gameInstance.SendMessage("SBKMSAds", "OnRewardedAdLoadFailed");
      setTimeout(loadRewarded, 15000);
    });
}

function showInterstitial() {
  console.log("[MSDR] Show interstital");

  if (!interstitial) {
    gameInstance.SendMessage("SBKMSAds", "OnInterstitialAdShowError");
    return;
  }

  $msstart
    .showAdsAsync(interstitial.instanceId)
    .then((adInstance) => {4
      gameInstance.SendMessage("SBKMSAds", "OnInterstitialAdStarted");
      adInstance.showAdsCompletedAsync
        .then(() => {
          gameInstance.SendMessage("SBKMSAds", "OnInterstitialAdClose");
        })
        .catch((e) => {
          console.error(
            "[MSDR] Error interstitial showAdsCompletedAsync: ",
            JSON.stringify(e)
          );
          gameInstance.SendMessage("SBKMSAds", "OnInterstitialAdShowError");
        })
        .finally(() => {
          loadInterstitial();
        });
    })
    .catch((e) => {
      console.error("[MSDR] Error show interstitial ad: ", JSON.stringify(e));
      gameInstance.SendMessage("SBKMSAds", "OnInterstitialAdShowError");
      loadInterstitial();
    });
}

function showRewarded() {
  console.log("[MSDR] Show rewarded");

  if (rewarded == null) {
    gameInstance.SendMessage("SBKMSAds", "OnRewardedAdShowError");
    return;
  }

  $msstart
    .showAdsAsync(rewarded.instanceId)
    .then((adInstance) => {
      gameInstance.SendMessage("SBKMSAds", "OnRewardedAdStarted");
      adInstance.showAdsCompletedAsync
        .then(() => {
          gameInstance.SendMessage("SBKMSAds", "OnRewardedAdShowSuccess");
        })
        .catch((e) => {
          console.error(
            "[MSDR] Error rewarded showAdsCompletedAsync: ",
            JSON.stringify(e)
          );
          gameInstance.SendMessage("SBKMSAds", "OnRewardedAdShowError");
        })
        .finally(() => {
          loadRewarded();
        });
    })
    .catch((e) => {
      console.error("[MSDR] Error show rewarded ad: ", JSON.stringify(e));
      gameInstance.SendMessage("SBKMSAds", "OnRewardedAdShowError");
      loadRewarded();
    });
}

function showBanner() {
  console.log("[MSDR] Show banner");
  $msstart
    .showDisplayAdsAsync("top:320x50")
    .then((response) => {
      console.log("[MSDR] " + response);
    })
    .catch((e) => {
      console.error("[MSDR] Error show banner ad: ", JSON.stringify(e));
    });
}

// function showBanner(position) {
//   console.log("[MSDR] Show banner");
//   $msstart
//     .showDisplayAdsAsync(position)
//     .then((response) => {
//       console.log("[MSDR] " + response);
//     })
//     .catch((e) => {
//       console.error("[MSDR] Error show banner ad: ", JSON.stringify(e));
//     });
// }

function hideBanner() {
  console.log("[MSDR] Hide banner");
  $msstart
    .hideDisplayAdsAsync()
    .then((response) => {
      console.log("[MSDR] " + response);
    })
    .catch((e) => {
      console.error("[MSDR] Error show banner ad: ", JSON.stringify(e));
    });
}
