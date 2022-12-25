import classNames from "classnames";
import { useRouter } from "next/router";
import React, { FC } from "react";

type Props = {
  style?: string;
};

const Back: FC<Props> = ({ style }) => {
  const router = useRouter();
  return (
    <p
      onClick={() => router.back()}
      className={"btn" + classNames({ [` ${style}`]: style })}
    >
      <i className="fas fa-chevron-left" />
    </p>
  );
};

export default Back;
