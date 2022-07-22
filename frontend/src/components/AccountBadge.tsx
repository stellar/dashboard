import { useMemo } from "react";

interface AccountBadgeProps {
  horizonURL: string;
  id: string;
}

export const AccountBadge: React.FC<AccountBadgeProps> = ({
  horizonURL,
  id,
}) => {
  const data = useMemo(() => {
    if (id) {
      return `${id.substring(0, 4)}...`;
    }

    return "";
  }, [id]);

  return (
    <span>
      <code>
        <a
          className="RecentOperations__TextLink"
          href={horizonURL + "/accounts/" + id}
          target="_blank"
          rel="noreferrer"
        >
          {data}
        </a>
      </code>
    </span>
  );
};
