import classNames from "classnames";
import React, { FC } from "react";

type Props = {
  style?: string;
};

const Spinner: FC<Props> = ({ style }) => {
  return (
    <div
      className={
        `w-10 border-gray-500 h-10 border-2 rounded-full border-b-0 animate-spin absolute left-1/2 top-1/2` +
        classNames({
          [` ${style}`]: style,
        })
      }
    />
  );
};

export default Spinner;
