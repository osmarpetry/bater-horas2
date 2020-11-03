import {
  apply,
  dropLast,
  flip,
  map,
  pipe,
  pluck,
  splitEvery,
  subtract,
  sum,
} from 'ramda';

const msToHours = (ms) => ms / 1000 / 60 / 60;
const newDate = (date) => new Date(date);

const hoursSumBtwnDates = pipe(
  pluck('created_at'),
  map(newDate),
  splitEvery(2),
  map(apply(flip(subtract))),
  sum,
  msToHours
);

const dropLastDate = (dates) => hoursSumBtwnDates(dropLast(1)(dates));

export const handPointHours = (appointments) =>
  appointments.length % 2 === 0
    ? hoursSumBtwnDates(appointments)
    : dropLastDate(appointments);
