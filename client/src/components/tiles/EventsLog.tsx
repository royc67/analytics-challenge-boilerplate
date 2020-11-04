import React, { useEffect, useState } from "react";
import { Event } from "../../models/event";
import { makeStyles } from "@material-ui/core/styles";
import styled from "styled-components";
import axios from "axios";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import { uniq } from "lodash/fp";
import TextField from "@material-ui/core/TextField";
import InfiniteScroll from "react-infinite-scroll-component";

interface EventComponentProps {
  event: Event;
}

interface UserColorProps {
  userId: string;
}

const EventDetail = styled.div`
  display: flex;
`;

const Wraper = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  overflow-x: hidden;
  width: 100%;
`;

const LogTile = styled.div`
  display: flex;
  gap: 30px;
  padding: 5px;
  height: 100%;
`;

const AccordionHead = styled.div`
  display: flex;
  gap: 10px;
`;

const EeventAccordion = styled.div`
  width: 100%;
  margin-left: auto;
  margin-right: auto;
`;

const UserColor = styled.div<UserColorProps>`
  background-color: ${(props) => getUserColor(props.userId)};
  border-radius: 100%;
  width: 30px;
  height: 30px;
`;

function getUserColor(userId: string): string {
  const red: number = (parseInt(userId) * 123) % 255;
  const blue: number = (parseInt(userId) * 456) % 255;
  const green: number = (parseInt(userId) * 789) % 255;

  return `rgb(${red},${green},${blue},0.9)`;
}

const useStyle = makeStyles((theme) => ({
  accordion: {
    border: "0.001px solid grey",
  },
  formControl: {
    // margin: theme.spacing(1),
    minWidth: 120,
  },
  configDiv: {
    width: "160px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  downUserName: {
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  upUserName: {
    display: "none",
    [theme.breakpoints.down("sm")]: {
      display: "initial",
    },
  },
}));

const EventComponent: React.FC<EventComponentProps> = ({ event }) => {
  const classes = useStyle();
  return (
    <>
      <EeventAccordion>
        <Accordion className={classes.accordion}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>
              <AccordionHead>
                <UserColor userId={event.distinct_user_id} />
                <Typography className={classes.downUserName}>
                  <EventDetail>User {event.distinct_user_id}</EventDetail>
                </Typography>
                <EventDetail>{event.name}</EventDetail>
              </AccordionHead>
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <Typography className={classes.upUserName}>
                <EventDetail>User {event.distinct_user_id}</EventDetail>
              </Typography>
              <EventDetail>Date: {new Date(event.date).toLocaleString()}</EventDetail>
              <EventDetail>Browser: {event.browser}</EventDetail>
              <EventDetail>Session ID: {event.session_id}</EventDetail>
            </Typography>
          </AccordionDetails>
        </Accordion>
      </EeventAccordion>
    </>
  );
};

const EventLog: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [offset, setOffset] = useState<number>(10);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [filters, setFilters] = useState({
    sorting: "none",
    type: "all",
    browser: "all",
    search: "",
  });

  const classes = useStyle();

  const fetch = React.useCallback(async (filters, offset) => {
    try {
      const { data } = await axios.get("http://localhost:3001/events/all-filtered", {
        params: {
          ...filters,
          offset,
        },
      });
      console.log(data);
      setHasMore(data.more);
      setEvents(data.events);
      return;
    } catch (error) {
      console.log(error);
      return;
    }
  }, []);

  useEffect(() => {
    fetch(
      {
        sorting: "none",
        type: "all",
        browser: "all",
        search: "",
      },
      5
    );
  }, [fetch]);

  function getAllTypes(): string[] {
    const types: string[] = events.map((event: Event) => event.name);

    return uniq(types);
  }

  function getAllBrowsers(): string[] {
    const types: string[] = events.map((event: Event) => event.browser);

    return uniq(types);
  }

  function handleChange(
    key: string,
    value: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) {
    setFilters({
      ...filters,
      [key]: value.target.value,
    });
    fetch(
      {
        ...filters,
        [key]: value.target.value,
      },
      5
    );
    setOffset(10);
  }

  return (
    <>
      <LogTile>
        <div className={classes.configDiv}>
          <TextField
            id="filled-basic"
            label="Search"
            variant="outlined"
            onChange={(event) => handleChange("search", event)}
            margin="dense"
          />
          <FormControl className={classes.formControl}>
            <InputLabel id="demo-simple-select-autowidth-label">Sort</InputLabel>
            <Select
              labelId="demo-simple-select-autowidth-label"
              id="demo-simple-select-autowidth"
              value={filters.sorting}
              onChange={(event) => handleChange("sorting", event)}
              autoWidth={true}
            >
              <MenuItem value="none">
                <em>None</em>
              </MenuItem>
              <MenuItem value={"-date"}>Date (Lastest First)</MenuItem>
              <MenuItem value={"+date"}>Date (Earliest First)</MenuItem>
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel id="demo-simple-select-autowidth-label">Type</InputLabel>
            <Select
              labelId="demo-simple-select-autowidth-label"
              id="demo-simple-select-autowidth"
              value={filters.type}
              onChange={(event) => handleChange("type", event)}
              autoWidth={true}
            >
              <MenuItem value="all">
                <em>All</em>
              </MenuItem>
              {getAllTypes().map((type: string) => {
                return <MenuItem value={type}>{type}</MenuItem>;
              })}
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel id="demo-simple-select-autowidth-label">Browser</InputLabel>
            <Select
              labelId="demo-simple-select-autowidth-label"
              id="demo-simple-select-autowidth"
              value={filters.browser}
              onChange={(event) => handleChange("browser", event)}
              autoWidth={true}
            >
              <MenuItem value="all">
                <em>All</em>
              </MenuItem>
              {getAllBrowsers().map((type: string) => {
                return <MenuItem value={type}>{type}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </div>
        <Wraper id={"eventsWraper"}>
          <InfiniteScroll
            dataLength={events.length}
            next={function () {
              fetch(filters, offset);
              setOffset(offset + 10);
            }}
            hasMore={hasMore}
            scrollableTarget={"eventsWraper"}
            loader={<h4>Loading...</h4>}
            endMessage={
              <p style={{ textAlign: "center" }}>
                <b>No more events to display!</b>
              </p>
            }
          >
            {events.map((event: Event) => (
              <EventComponent event={event} />
            ))}
          </InfiniteScroll>
        </Wraper>
      </LogTile>
    </>
  );
};

export default EventLog;
