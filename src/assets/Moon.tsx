type Props = {
  fill?: string;
};

const Moon = (props: Props) => {
  const { fill, ...rest } = props;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" {...rest}>
      <path
        fill={fill ? fill : "currentColor"}
        d="M5.594 0A8.2 8.2 0 0 0 0 7.774 8.224 8.224 0 0 0 8.226 16 8.2 8.2 0 0 0 16 10.406c-.823.268-1.707.453-2.632.453A8.224 8.224 0 0 1 5.14 2.632c0-.925.165-1.81.453-2.632Z"
      />
    </svg>
  );
};
export default Moon;
