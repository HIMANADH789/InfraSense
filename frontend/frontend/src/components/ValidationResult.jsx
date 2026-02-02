export default function ValidationResult({ data }) {
  return (
    <div>
      <h3>Validation Result</h3>

      <p>
        Status:
        <strong className={data.valid ? "valid" : "invalid"}>
          {data.valid ? " VALID" : " INVALID"}
        </strong>
      </p>

      {data.warnings?.length > 0 && (
        <>
          <h4>Warnings</h4>
          <ul>
            {data.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
