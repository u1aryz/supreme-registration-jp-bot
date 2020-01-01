import * as dayjs from "dayjs";
import * as React from "react";
import {TextField, Theme} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Alarm, EventType, Status} from "../model";

import IncomingMessage = chrome.gcm.IncomingMessage;

const {memo, useEffect, useState} = React;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    "& > div:not(:last-child)": {
      marginBottom: theme.spacing(1),
    },
  },
}));

export default memo(() => {
  const classes = useStyles();
  const [alarm, setAlarm] = useState<Alarm>();
  const [message, setMessage] = useState();
  const [port] = useState(() => chrome.runtime.connect());

  useEffect(() => {
    const listener = (msg: IncomingMessage): void => {
      const status = msg.data as Status;
      setAlarm(status.alarm);
      setMessage(status.message);
    };
    port.onMessage.addListener(listener);
    return () => port.onMessage.removeListener(listener);
  }, []);

  const onSetClick = (): void => {
    if (alarm?.when) {
      port.postMessage({eventType: EventType.AlarmSetClicked, data: alarm.when});
    } else {
      setMessage("Invalid time");
    }
  };

  const onStopClick = (): void => {
    port.postMessage({eventType: EventType.AlarmStopClicked});
  };

  const onTimeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const when = dayjs(event.target.value).valueOf();
    setAlarm((prevState) => prevState && {...prevState, when});
  };

  return (
    <div className={classes.root}>
      <div>
        <TextField
          label="Start time"
          type="datetime-local"
          value={alarm?.when ? dayjs(alarm.when).format("YYYY-MM-DDTHH:mm:ss") : ""}
          onChange={onTimeChange}
          disabled={alarm?.isSet}
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            name: "timer",
            step: 1,
          }}
        />
      </div>
      <div>
        <Button variant="contained" color="primary" fullWidth disabled={alarm?.isSet} onClick={onSetClick}>
          Set alarm
        </Button>
      </div>
      <div>
        <Button variant="contained" fullWidth disabled={!alarm?.isSet} onClick={onStopClick}>
          Stop alarm
        </Button>
      </div>
      {message && <div>{message}</div>}
    </div>
  );
});
