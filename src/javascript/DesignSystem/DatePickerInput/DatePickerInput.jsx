import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';

import {DatePicker} from '../DatePicker';
import {withStyles} from '@material-ui/core/styles';

import dayjs from 'dayjs';

const style = {
    overlay: {
        position: 'absolute',
        zIndex: 1
    }
};

const datetimeFormat = {
    date: 'L',
    datetime: 'L HH:mm'
};

const formatDateTime = (datetime, lang, variant) => {
    if (!datetime) {
        return '';
    }

    return dayjs(datetime)
        .locale(lang)
        .format(datetimeFormat[variant]);
};

const DatePickerInputCmp = ({
    variant,
    lang,
    classes,
    onBlur,
    onChange,
    initialValue,
    ...props
}) => {
    const [overlayShowed, showOverlay] = useState(false);
    const [datetime, setDatetime] = useState(initialValue);
    const [datetimeString, setDatetimeString] = useState(
        formatDateTime(datetime, lang, variant)
    );

    const [eventQueue, setEventQueue] = useState([]);
    const pushToEventQueue = valueWanted => {
        setEventQueue([...eventQueue, valueWanted]);
    };

    useEffect(() => {
        if (eventQueue.length === 0) {
            return;
        }

        const timeout = setTimeout(() => {
            showOverlay(eventQueue[eventQueue.length - 1]);
            setEventQueue([]);

            // If datepicker overlay is not showed anymore, it's an onblur event
            if (eventQueue[eventQueue.length - 1] === false) {
                onBlur();
            }
        }, 100);

        return () => {
            clearTimeout(timeout);
        };
    }, [eventQueue, onBlur]);

    useEffect(() => {
        setDatetimeString(formatDateTime(datetime, lang, variant));
    }, [lang, variant]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div>
            <input
                value={datetimeString}
                onFocus={() => {
                    pushToEventQueue(true);
                }}
                onBlur={() => {
                    pushToEventQueue(false);
                }}
                onChange={e => {
                    setDatetimeString(e.target.value);
                    const newDate = dayjs(
                        e.target.value,
                        datetimeFormat[variant]
                    );
                    if (newDate.isValid()) {
                        setDatetime(newDate.toDate());
                        onChange(newDate.toDate().toISOString());
                    }
                }}
                {...props}
            />
            <div className={classes.overlay}>
                {overlayShowed && (
                    <DatePicker
                        variant={variant}
                        lang={lang}
                        selectedDateTime={datetime}
                        onFocus={() => {
                            pushToEventQueue(true);
                        }}
                        onBlur={() => {
                            pushToEventQueue(false);
                        }}
                        onSelectDateTime={datetime => {
                            onChange(datetime.toISOString());
                            setDatetime(datetime);
                            setDatetimeString(
                                formatDateTime(datetime, lang, variant)
                            );
                        }}
                    />
                )}
            </div>
        </div>
    );
};

DatePickerInputCmp.defaultProps = {
    variant: 'date',
    onBlur: () => {},
    onChange: () => {},
    initialValue: null
};

DatePickerInputCmp.propTypes = {
    classes: PropTypes.object.isRequired,
    lang: PropTypes.oneOf(['fr', 'en', 'de']).isRequired,
    variant: PropTypes.oneOf(['date', 'datetime']),
    initialValue: PropTypes.object,
    onBlur: PropTypes.func,
    onChange: PropTypes.func
};

export const DatePickerInput = withStyles(style)(DatePickerInputCmp);

DatePickerInput.displayName = 'DatePickerInput';
