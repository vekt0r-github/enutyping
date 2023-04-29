import React from "react";

import { getL10nFunc, L10nFunc } from "@/providers/l10n";

// lol idk where this should go
const Loading = () => {
  const text = getL10nFunc();

  return <p>{text(`loading`)}</p>
};

export default Loading;
