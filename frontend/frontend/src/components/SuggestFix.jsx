export default function SuggestFix({ data }) {
  if (!data) return null;

  const recs = data.recommendations || [];

  return (
    <div>
      <h3>Improvement Suggestions</h3>

      {recs.length === 0 ? (
        <p style={{ color: "green" }}>
           No major issues detected
        </p>
      ) : (
        <ul>
          {recs.map((item, index) => (
            <li key={index}>
              <b>{item.type.toUpperCase()}</b>
              <br />
              {item.target}
              <br />
               {item.suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
