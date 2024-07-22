import Scrollbars from "react-custom-scrollbars-2";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}
export default function ScrollContainer({ children }: Props) {
  return (
    <Scrollbars
      autoHeightMin={"100vh"}
      renderThumbVertical={({ style }) => (
        <div
          style={{
            ...style,
            backgroundColor: "gray",
            borderRadius: "8px",
            zIndex: 10,
          }}
        />
      )}
      autoHeight
    >
      {children}
    </Scrollbars>
  );
}
