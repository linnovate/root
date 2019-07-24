"use strict";

angular
  .module("mean.icu.data.notificationsservice", [])
  .service("NotificationsService", function(
    $http,
    ApiUri,
    WarningsService,
    $state
  ) {
    let audio = window.notificationAudio;

    if (!window.notificationAudio) {
      audio = window.notificationAudio = document.createElement("audio");
      audio.type = "audio/ogg";

      // Taken from: https://notificationsounds.com/sound-effects/just-like-magic-506
      audio.src = "/dist/icu/assets/audio/just-like-magic.mp3";
    }

    if (Notification.permission !== "denied") {
      Notification.requestPermission(permission => {});
    }

    function notify(data) {
      if (Notification.permission === "denied") {
        console.log("Notification aborted - permission denied");
        return;
      }

      let { title, body, icon } = parseNotification(data);

      let notification = new Notification(title, {
        body,
        icon: `/icu/assets/img/notification/${icon}.png`
      });

      notification.onclick = function(event) {
        this.close();
        window.focus();
        $state.go(
          `main.${data.entityType}s.all.details.${window.config.defaultTab}`,
          {
            entity: "all",
            id: data.entity._id,
            nameFocused: true
          },
          {
            reload: true
          }
        );
      };

      // Start from beginning in case of consecutive when previous audio didn't yet finished
      audio.currentTime = 0;

      audio.play();

      // Hide after 4s
      setTimeout(notification.close.bind(notification), 4000);
    }

    function parseNotification(data) {
      let { entity, entityType, creator, updateField, current, prev } = data;

      // Strip html tags
      let entityTitle = entity.title.replace(/<(?:.|\n)*?>/gm, "");
      let creatorName = creator.name;

      let title, body, icon;

      switch (updateField) {
        case "assign":
          title = `${entityTitle} assigned to you`;
          body = `${entityTitle} has been assigned to you by ${creatorName}`;
          break;
        case "due":
          current = formatDate(current);
          prev = formatDate(prev);
          title = `${entityTitle} due » ${current}`;
          body = `${creatorName} has change the due date of ${entityTitle} from "${prev}" to "${current}"`;
          break;
        case "status":
          current = toCapitalCase(current);
          prev = toCapitalCase(prev);
          title = `${entityTitle} status » ${current}`;
          body = `${creatorName} has change the status of ${entityTitle} from "${prev}" to "${current}"`;
          break;
        case "comment":
          title = `${entityTitle} comment`;
          body = `${creatorName} commented: "${current}"`;
          break;
      }

      // Set different icons for every entity, default to `task` icon
      if (
        ["officeDocument", "task", "project", "discussion"].includes(entityType)
      ) {
        icon = entityType;
      } else {
        icon = "task";
      }

      return { title, body, icon };
    }

    function formatDate(date) {
      return moment(date).format("DD/MM/YYYY");
    }

    function toCapitalCase(txt) {
      return txt[0].toUpperCase() + txt.slice(1);
    }

    return {
      notify
    };
  });
