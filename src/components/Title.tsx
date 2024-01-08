function Title({ onClick }: { onClick: () => void }) {
  return (
    <h1 className="p-4 text-2xl font-bold text-white" onClick={onClick}>
      Mail Badara
    </h1>
  );
}

export default Title;
