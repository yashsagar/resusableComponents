import { Box, Paper } from "@mui/material";
import AutoCompleteInput from "../../components/InputFields/AutoCompleteInput";
import { useCallback, useMemo, useState } from "react";
import { CustomInputEvents } from "../../types/inputEvent";

type State = {
  listOfString: any;
  listOfObject: any;
  listOfOtherObject: any;
};

type ListOfOtherObject = {
  passId: string;
  visitor: {
    name: string;
    emailId: string;
    phoneNumber: string;
    Id: string;
    organization: string;
  };
  passValidFrom: string;
  passValidUntil: string;
  personToMeet: {
    name: string;
    phoneNumber: string;
  };
  passCurrentStatus: "open" | "close" | "checkIn" | "checkOut";
};

type ListOfObject = { value: number; displayValue: string };

const Settings = () => {
  const [state, setState] = useState<State>(() => ({
    listOfString: "",
    listOfObject: "",
    listOfOtherObject: "",
  }));

  const listOfString = ["one", "two", "three"];
  const listOfObject = [
    { value: 1, displayValue: "one" },
    { value: 2, displayValue: "two" },
    { value: 3, displayValue: "three" },
  ];
  const listOfOtherObject: ListOfOtherObject[] = [
    {
      passId: "684b17d34cee4b5aa3f2cb0b",
      visitor: {
        name: "test user 1",
        emailId: "",
        phoneNumber: "9036369393",
        Id: "684b17a14cee4b5aa3f2cb01",
        organization: "REX-1",
      },
      passValidFrom: "2025-06-12T18:08:38.247Z",
      passValidUntil: "2025-06-15T18:30:00.000Z",
      personToMeet: {
        name: "",
        phoneNumber: "",
      },
      passCurrentStatus: "open",
    },
    {
      passId: "684b17d34cee4b5aa3f2cb0b",
      visitor: {
        name: "yash",
        emailId: "",
        phoneNumber: "9036369393",
        Id: "684b17a14cee4b5aa3f2cb02",
        organization: "REX-1",
      },
      passValidFrom: "2025-06-12T18:08:38.247Z",
      passValidUntil: "2025-06-15T18:30:00.000Z",
      personToMeet: {
        name: "",
        phoneNumber: "",
      },
      passCurrentStatus: "open",
    },
  ];

  const handelOnchange1 = useCallback(
    <P,>(event: CustomInputEvents.AutoSelect<P>) => {
      console.log(event);
    },
    []
  );

  const linkFields = useMemo(() => {
    return {
      value: "visitor.Id" as keyof ListOfOtherObject,
      displayValue: "visitor.name" as keyof ListOfOtherObject,
    };
  }, []);

  return (
    <Paper sx={{ width: "100vw", height: "100vh" }}>
      <Box sx={{ p: 5, pb: 3 }}>
        <p>listOfString</p>
        <AutoCompleteInput
          name="listOfString"
          onChange={handelOnchange1}
          options={listOfString}
          value={state.listOfString}
          sx={{
            width: "400px",
          }}
        />
      </Box>
      <Box sx={{ px: 5, py: 3 }}>
        <p>listOfObject</p>
        <AutoCompleteInput<ListOfObject>
          name="listOfObject"
          onChange={handelOnchange1}
          options={listOfObject}
          value={state.listOfString}
          sx={{
            width: "400px",
          }}
        />
      </Box>
      <Box sx={{ px: 5, py: 3 }}>
        <p>listOfOtherObject</p>
        <AutoCompleteInput<ListOfOtherObject>
          name="listOfString"
          onChange={handelOnchange1}
          options={listOfOtherObject}
          linkOptionField={linkFields}
          value={state.listOfString}
          sx={{
            width: "400px",
          }}
        />
      </Box>
    </Paper>
  );
};

export default Settings;
