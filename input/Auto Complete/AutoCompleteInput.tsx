import React, { CSSProperties, useCallback, useMemo } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, {
  AutocompleteChangeReason,
  AutocompleteRenderInputParams,
  AutocompletePropsSizeOverrides,
} from "@mui/material/Autocomplete";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import { OverridableStringUnion } from "@mui/types";
import { SxProps } from "@mui/material";
import _ from "lodash";

//type import
import type {
  AutoCompleteChangedValue,
  autoComReturnOptionInfo,
  DefaultOptionsInterface,
  OptionItemInfo,
} from "../../types/components/inputComponent/autoCompleteInput.type";
import { CustomInputEvents } from "../../types/inputEvent";

// note 1: this input component based on option prop
// option prop can be string or array of object this object can be any type
// but must have "value" and "displayValue" filed if not you have to link fields using "linkOptionField"
//custom prop function when you calling have to pass type
// here "value" is equivalent input value prop and "displayValue" just value to show user if you want same
// string(which is showing in UI) as value then you can give same value to both

// note 2: this is controlled component means we have pass value (state value) and we will get the value
// when it change then we will store in state and pass back same to component
// we pass value using value prop and get value by isOptionEqualToValue for that we use "options.value" field

//if you are passing the custom Option and want to display text and value both to same then
// use "linkOptionField" and give same value to both "value" and "displayValue"

//if you are using "freeSolo" then use displayValue else use "value"

interface AutoCompleteProps<P> {
  // here P is options item type (with out array only one element ) have to pass along with component
  name: string;
  value: string;
  label?: string;
  options: P[];
  onChange?: (event: CustomInputEvents.AutoSelect<P>) => void;
  linkOptionField?: {
    value: keyof P | "value";
    displayValue: keyof P | "displayValue";
  };
  error?: string | boolean;
  required?: boolean;
  onBlur?: () => void;
  fullWidth?: boolean;
  disabled?: boolean;
  resetKey?: string;
  renderInput?: (params: AutocompleteRenderInputParams) => React.ReactNode;
  multiple?: boolean;
  freeSolo?: boolean;
  size?: OverridableStringUnion<
    "small" | "medium",
    AutocompletePropsSizeOverrides
  >; // MUI only take this value if you want custom style use "SX" prop
  placeholder?: string;
  sx?: SxProps;
  wrapperStyle?: CSSProperties;
  includeInputInList?: boolean;
}

const AutoCompleteInput = <P = string,>({
  name,
  value,
  label,
  onChange,
  options,
  linkOptionField, //optional use if options item don't have value and displayValue to link
  error,
  required,
  onBlur = () => {},
  fullWidth,
  disabled = false,
  resetKey,
  multiple,
  freeSolo = true,
  wrapperStyle,
  includeInputInList = false,
  ...rest
}: AutoCompleteProps<P>): React.ReactElement => {
  const getDataType = useCallback(
    (
      data: string | P | (string | P)[] | null = options,
      type: "option" | "value" = "option"
    ) => {
      if (_.isArray(data) && type === "option") {
        if (_.isString(data[0])) {
          return "string";
        } else if (_.isObject(data[0])) {
          return "object";
        }
      } else if (type === "value") {
        if (_.isString(data)) {
          return "string";
        } else if (_.isObject(data)) {
          return "object";
        }
      }
      return null;
    },
    [options]
  );

  const getOptionsFields = useMemo(() => {
    return (
      linkOptionField ?? {
        value: "value",
        displayValue: "displayValue",
      }
    );
  }, [linkOptionField]);

  const getSelectedOptionInfo = useCallback(
    ({
      selectedValue, // selected value event.target.value or displayValue
      returnValueType = "full", // return value or display name or displayValue
      valueFieldType = "value", // displayField or valueField}
    }: autoComReturnOptionInfo<P>):
      | OptionItemInfo<P>
      | OptionItemInfo<P>[keyof OptionItemInfo<P>] => {
      console.log("triggerd");

      let optionItemInfo: OptionItemInfo<P> = {
        value: "",
        displayValue: "",
        option: "",
      };
      const optionItemType = getDataType();

      if (optionItemType === "string") {
        optionItemInfo = {
          value: selectedValue,
          displayValue: selectedValue,
          option: options,
        };
      } else if (optionItemType === "object") {
        const selectedOption = options.find((optionItem) => {
          return (
            _.get(optionItem, getOptionsFields[valueFieldType]) ===
            selectedValue
          );
        });

        optionItemInfo = {
          value: selectedOption
            ? _.get(selectedOption, getOptionsFields.value)
            : "",
          displayValue: selectedOption
            ? _.get(selectedOption, getOptionsFields.displayValue)
            : "",
          option: selectedOption,
        };
      }

      if (
        (returnValueType && returnValueType === "value") ||
        (returnValueType && returnValueType === "displayValue")
      ) {
        return optionItemInfo[returnValueType as keyof OptionItemInfo<P>];
      }

      return optionItemInfo;
    },
    [options, getDataType, getOptionsFields]
  );

  // here generate displayValue based on props configuration have return the value to display
  // run for every dropdown the list
  const getOptionLabel = useCallback(
    (optionItem: P | string) => {
      let displayValue = "";
      if (typeof optionItem === "string") {
        displayValue = optionItem;
      } else {
        displayValue = String(_.get(optionItem, getOptionsFields.displayValue));
      }
      return displayValue;
    },
    [getOptionsFields]
  );

  // here we helping the MUI to show correct display value based on the value prop/attribute value
  //the value is option.value(id) return value
  const isOptionEqualToValue = useCallback(
    (optionItem: P, value: P) => {
      //check is option is string if yes compare with value directly else get value from
      // option and the compare then return boolean

      if (!optionItem || !value) return false;

      if (typeof optionItem === "string" && typeof value === "string") {
        return Boolean(optionItem === value);
      }

      if (typeof optionItem === "object" && typeof value === "object") {
        return Boolean(
          _.get(optionItem, getOptionsFields.displayValue) ===
            _.get(value, getOptionsFields.displayValue)
        );
      }
      return false;
    },
    [getOptionsFields]
  );

  // MUI Autocomplete value must be item on options array (it may object or string )
  // but our custom component accept only string so this function check and give correct value

  const selectedOptionObject = useCallback(
    (options: P[], value: string) => {
      //check is option is string if yes compare with value directly else get value from
      // option and the compare then return boolean

      //need check here
      // const optionValueField =
      //   typeof linkOptionField === "function"
      //     ? linkOptionField<P>().value
      //     : "displayValue";

      return options?.find((item) =>
        typeof item === "string"
          ? item === value
          : _.get(item, getOptionsFields.value) === value
      );
    },
    [getOptionsFields]
  );

  const normalizeChangedValue = useCallback(
    <P,>(input: unknown, name: string): AutoCompleteChangedValue<P> => {
      if (
        typeof input === "object" &&
        input !== null &&
        "value" in input &&
        "displayValue" in input
      ) {
        return {
          ...(input as AutoCompleteChangedValue<P>),
          name,
        };
      }

      return {
        name,
        value: "",
        displayValue: "",
        option: "",
        reason: "",
        eventType: "",
      };
    },
    []
  );

  const checkMatchedOptionValue = useCallback(
    (value: string | P) => {
      const getOptionItemType = getDataType();
      if (
        _.isString(value) &&
        getOptionItemType === "string" &&
        _.isArray(options)
      ) {
        return {
          type: "string",
          matchedValue: _.find(
            options,
            (opt) =>
              typeof opt === "string" && _.toLower(opt) === _.toLower(value)
          ),
        };
      } else if (
        _.isString(value) &&
        getOptionItemType === "object" &&
        _.isArray(options)
      ) {
        return {
          type: "object",
          matchedValue: _.find(options, (item: P) => {
            const fieldValue = _.get(item, getOptionsFields.displayValue);
            return (
              typeof fieldValue === "string" &&
              _.toLower(fieldValue) === _.toLower(String(value))
            );
          }),
        };
      }
    },
    [options, getDataType, getOptionsFields]
  );

  const localOnChange = useCallback(
    (
      event: React.SyntheticEvent,
      value: string | P | (string | P)[] | null | DefaultOptionsInterface,
      reason?: AutocompleteChangeReason
    ) => {
      if (reason === "createOption") {
        return;
      }

      let changedValue: AutoCompleteChangedValue<P> = {
        value: null,
        displayValue: "",
        option: "",
        name: name,
        eventType: event.type,
        reason: reason,
      };

      const optionSelection = () => {
        if (typeof value === "string") {
          const getValues = getSelectedOptionInfo({
            selectedValue: value,
          });

          if (_.isObject(getValues)) {
            changedValue = normalizeChangedValue(getValues, name);
            if (typeof onChange === "function") {
              onChange({ target: changedValue });
            }
          }
        } else if (_.isObject(value) && value !== null) {
          const getValues = getSelectedOptionInfo({
            selectedValue: _.get(value, getOptionsFields.value),
          });
          if (_.isObject(getValues)) {
            changedValue = normalizeChangedValue(getValues, name);
            if (typeof onChange === "function") {
              onChange({ target: changedValue });
            }
          }
        }
      };

      const clear = () => {
        if (typeof onChange === "function") {
          onChange({
            target: {
              value: null,
              displayValue: "",
              option: "",
              name: name,
              eventType: event.type,
              reason: reason,
            },
          });
        }
      };

      if (event.type === "click") {
        if (reason === "selectOption") {
          changedValue.reason = "selectOption";
          optionSelection();
        }
        if (reason === "clear") {
          changedValue.reason = "clear";
          clear();
        }
      } else if (reason === "selectOption" && event.type === "keydown") {
        optionSelection();
        return;
      } else if (
        event.type === "change" ||
        (event.type === "keydown" && reason !== undefined)
      ) {
        const target = event.target as HTMLInputElement;
        const includedValue = checkMatchedOptionValue(target.value);

        if (includedValue?.type === "string") {
          const returnValue = {
            ...changedValue,
            displayValue: target.value,
            value: includedValue?.matchedValue ?? "",
            option: options,
          };

          changedValue = normalizeChangedValue(returnValue, name);
          if (typeof onChange === "function") {
            onChange({ target: changedValue });
          }
          return;
        }

        if (includedValue?.type === "object") {
          if (_.isObject(includedValue?.matchedValue)) {
            const matched = includedValue?.matchedValue as P;
            changedValue.value = _.get(matched, getOptionsFields.value);
            changedValue.displayValue =
              _.get(matched, getOptionsFields.displayValue) ?? target.value;
            changedValue.option = matched;

            if (typeof onChange === "function") {
              onChange({ target: normalizeChangedValue(changedValue, name) });
            }
            return;
          }

          if (typeof onChange === "function") {
            onChange({
              target: normalizeChangedValue(
                { ...changedValue, displayValue: target.value },
                name
              ),
            });
          }
        }
      }
    },
    [
      options,
      checkMatchedOptionValue,
      getOptionsFields,
      getSelectedOptionInfo,
      normalizeChangedValue,
      name,
      onChange,
    ]
  );

  const renderInput = useCallback(
    (params: AutocompleteRenderInputParams) => {
      const localOnKeyPress = (
        event: React.KeyboardEvent<HTMLInputElement>
      ) => {
        if (event.key === "Enter") {
          event.preventDefault();

          localOnChange(
            event,
            String((event.target as HTMLInputElement).value)
          );
        }
      };

      const localOnInputChange = (
        event: React.ChangeEvent<HTMLInputElement>
      ) => {
        const target = event.target;
        localOnChange(event, target.value);
      };

      return (
        <TextField
          {...params}
          label={label}
          error={Boolean(error)}
          value={value}
          name={name}
          onChange={localOnInputChange}
          onKeyDown={localOnKeyPress}
          variant="outlined"
          required={required}
          size="small"
          autoComplete="do-not-autofill"
          inputProps={{
            ...params.inputProps,
            autoComplete: "do-not-autofill",
          }}
        />
      );
    },
    [localOnChange, value, error, label, name, required]
  ); // done

  return (
    <div
      key={resetKey}
      style={
        fullWidth ? { width: "100%", ...wrapperStyle } : { ...wrapperStyle }
      }
    >
      <FormControl fullWidth={fullWidth} error={Boolean(error)}>
        <Autocomplete
          freeSolo={freeSolo}
          multiple={multiple}
          options={Array.isArray(options) ? options : []}
          value={selectedOptionObject(options, value) ?? value}
          isOptionEqualToValue={isOptionEqualToValue}
          onChange={localOnChange}
          getOptionLabel={getOptionLabel}
          onBlur={onBlur}
          includeInputInList={includeInputInList}
          fullWidth={Boolean(fullWidth)}
          disabled={disabled}
          renderInput={renderInput}
          {...rest}
        />
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    </div>
  );
};

export default AutoCompleteInput;
