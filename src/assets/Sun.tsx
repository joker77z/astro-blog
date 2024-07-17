type Props = {
  fill?: string;
};

const SvgComponent = (props: Props) => {
  const { fill, ...rest } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      fill="none"
      {...rest}
    >
      <path
        fill={fill ? fill : "#5E5E5E"}
        d="M8 0c-.56 0-1 .44-1 1s.44 1 1 1 1-.44 1-1-.44-1-1-1ZM3 2c-.56 0-1 .44-1 1s.44 1 1 1 1-.44 1-1-.44-1-1-1Zm10 0c-.56 0-1 .44-1 1s.44 1 1 1 1-.44 1-1-.44-1-1-1ZM8 4C5.8 4 4 5.8 4 8s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4ZM1 7c-.56 0-1 .44-1 1s.44 1 1 1 1-.44 1-1-.44-1-1-1Zm14 0c-.56 0-1 .44-1 1s.44 1 1 1 1-.44 1-1-.44-1-1-1ZM3 12c-.56 0-1 .44-1 1s.44 1 1 1 1-.44 1-1-.44-1-1-1Zm10 0c-.56 0-1 .44-1 1s.44 1 1 1 1-.44 1-1-.44-1-1-1Zm-5 2c-.56 0-1 .44-1 1s.44 1 1 1 1-.44 1-1-.44-1-1-1Z"
      />
    </svg>
  );
};
export default SvgComponent;
