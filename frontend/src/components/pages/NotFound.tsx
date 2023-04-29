import React from "react";

import { getL10nElementFunc } from "@/providers/l10n";

import { Link } from "@/utils/styles";

const NotFound = () => {
  const elem = getL10nElementFunc();

  return elem((<p></p>), `not-found`, {
    elems: {Link: <Link as="a" href="/" />},
  })
};

export default NotFound;
