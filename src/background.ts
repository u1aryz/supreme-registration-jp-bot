import chromep from "chrome-promise";
import * as dayjs from "dayjs";
import {Alarm, EventType, Registration, Status} from "./types";

import TabChangeInfo = chrome.tabs.TabChangeInfo;
import Port = chrome.runtime.Port;

class Background {
  private timeoutId?: NodeJS.Timer;

  private port?: Port;

  private status: Status;

  constructor() {
    // Today 11:00
    const alarm: Alarm = {
      when: dayjs()
        .startOf("day")
        .set("hour", 11)
        .valueOf(),
      isSet: false,
    };
    this.status = {alarm};
  }

  public setup(): void {
    chrome.tabs.onUpdated.addListener(async (tabId: number, changeInfo: TabChangeInfo) => {
      try {
        if (changeInfo.status === "loading") {
          await chromep.pageAction.show(tabId);
        }
      } catch (err) {
        // Ignore error
      }
    });

    chrome.runtime.onConnect.addListener((port) => {
      this.port = port;
      // Reconnect to popup
      this.updateStatus(this.status);

      // Disconnect
      port.onDisconnect.addListener(() => delete this.port);

      // Receive message
      port.onMessage.addListener((message) => {
        switch (message.eventType) {
          case EventType.AlarmSetClicked:
            this.onSetClick(message.data);
            break;
          case EventType.AlarmStopClicked:
            this.onStopClick();
            break;
          default:
            break;
        }
      });
    });
  }

  private onSetClick(when: number): void {
    const delay = when - Date.now();
    this.updateStatus({alarm: {when, isSet: true}, message: "アラーム設定中..."});
    this.timeoutId = setTimeout(async () => this.onAlarmStart(), delay);
  }

  private onStopClick(): void {
    if (this.timeoutId) {
      // Stop alarm
      clearTimeout(this.timeoutId);
    }
    const oldAlarm = this.status.alarm;
    const newAlarm = {...oldAlarm, isSet: false};
    this.updateStatus({alarm: newAlarm, message: "アラームを解除しました"});
  }

  private async onAlarmStart(): Promise<void> {
    const store: {registrations?: Registration[]} = await chromep.storage.local.get();
    store.registrations?.forEach((value) => {
      chrome.tabs.create({url: `https://japan.supremenewyork.com/?id=${value.id}`});
    });

    const oldAlarm = this.status.alarm;
    const newAlarm = {...oldAlarm, isSet: false};
    this.updateStatus({alarm: newAlarm, message: "アラームの時間になりました"});
  }

  private updateStatus(status: Status): void {
    this.status = status;
    this.port?.postMessage({eventType: EventType.StatusChanged, data: status});
  }
}

new Background().setup();
