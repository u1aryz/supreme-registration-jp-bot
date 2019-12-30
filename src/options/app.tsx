import * as React from "react";
import * as uuid from "uuid";
import {Button, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import chromep from "chrome-promise";
import {Registration} from "../model";
import Item from "./item";

const {memo, useEffect, useReducer} = React;

interface Action {
  type: "ADD" | "EDIT" | "DELETE";
  item?: Registration;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    "& > button": {
      marginRight: theme.spacing(1),
    },
  },
}));

export default memo(() => {
  const classes = useStyles();

  const reducer = (items: Registration[], action: Action): Registration[] => {
    switch (action.type) {
      case "ADD":
        return [
          ...items,
          action.item ?? {
            id: uuid.v1(),
            name: "",
            email: "",
            tel: "",
            location: "tokyo",
          },
        ];
      case "EDIT":
        return items.map((value) => {
          if (value.id === action.item?.id) {
            return action.item;
          }
          return value;
        });
      case "DELETE":
        return items.filter((value) => {
          return value.id !== action.item?.id;
        });
      default:
        return items;
    }
  };

  const [registrations, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    (async () => {
      const store: {registrations?: Registration[]} = await chromep.storage.local.get();
      if (store.registrations) {
        store.registrations.forEach((value) => dispatch({type: "ADD", item: value}));
      } else {
        // No data in storage
        dispatch({type: "ADD"});
      }
    })();
  }, []);

  const onChange = (registration: Registration): void => {
    dispatch({type: "EDIT", item: registration});
  };

  const onDelete = (registration: Registration): void => {
    dispatch({type: "DELETE", item: registration});
  };

  const onAddClick = (): void => {
    dispatch({type: "ADD"});
  };

  const onSaveClick = async (): Promise<void> => {
    await chromep.storage.local.set({registrations});
  };

  return (
    <div className={classes.root}>
      {registrations.map((value) => {
        return <Item key={value.id} registration={value} onChange={onChange} onDelete={onDelete} />;
      })}
      <Button variant="contained" type="button" onClick={onAddClick}>
        Add
      </Button>
      <Button variant="contained" type="button" onClick={onSaveClick}>
        Save
      </Button>
    </div>
  );
});
