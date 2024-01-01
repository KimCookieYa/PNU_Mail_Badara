function Title({ onClick }: { onClick: () => void }) {
  return (
    <>
      <div className="p-4 text-white">
        <div className="container mx-auto">
          <div className="text-3xl font-bold" onClick={onClick}>
            Mail Badara
          </div>
        </div>
      </div>
    </>
  );
}

export default Title;
