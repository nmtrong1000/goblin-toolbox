import { useTranslation } from 'react-i18next';

type SearchFormProps = {
  query: string;
  onQueryChange: (query: string) => void;
};

export function SearchForm({ query, onQueryChange }: SearchFormProps) {
  const { t } = useTranslation();

  return (
    <form className="search-form" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="tool-search">{t('home.searchLabel')}</label>
      <div className="search-control">
        <input
          autoComplete="off"
          id="tool-search"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t('home.searchPlaceholder')}
          type="search"
          value={query}
        />
        <button className="button-primary" type="submit">
          {t('home.searchAction')}
        </button>
      </div>
    </form>
  );
}
