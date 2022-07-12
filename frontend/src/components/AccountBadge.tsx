interface AccountBadgeProps {
  horizonURL: string;
  id: string;
}

export const AccountBadge: React.FC<AccountBadgeProps> = ({
  horizonURL,
  id,
}) => {
  return (
    <span>
      <code>
        <a
          className="RecentOperations__TextLink"
          href={horizonURL + "/accounts/" + id}
          target="_blank"
          rel="noreferrer"
        >
          {id.substring(0, 4)}...
        </a>
      </code>
    </span>
  );
};
