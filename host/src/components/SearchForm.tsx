import { useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TypingPlaceholder } from '#/components/TypingPlaceholder.tsx';
import { useTypingText } from '#/hooks/useTypingText.ts';

type SearchFormProps = {
  query: string;
  onQueryChange: (query: string) => void;
};

export function SearchForm({ query, onQueryChange }: SearchFormProps) {
  const { t } = useTranslation();
  const input = useRef<HTMLInputElement>(null);
  const [touched, setTouched] = useState(false);
  const hint = useTypingText(
    [t('home.searchHint1'), t('home.searchHint2'), t('home.searchHint3')],
    touched,
  );

  function clear() {
    onQueryChange('');
    input.current?.focus();
  }

  return (
    <form className="search-form" onSubmit={(event) => event.preventDefault()} role="search">
      <label htmlFor="tool-search">{t('home.searchLabel')}</label>
      <div className="search-control">
        <Search aria-hidden="true" className="search-icon" size={22} />
        <div className="search-field">
          <input
            autoComplete="off"
            id="tool-search"
            onChange={(event) => onQueryChange(event.target.value)}
            onFocus={() => setTouched(true)}
            ref={input}
            type="search"
            value={query}
          />
          {query === '' && <TypingPlaceholder text={hint.text} typing={hint.typing} />}
        </div>
        {query !== '' && (
          <button
            aria-label={t('home.clearSearch')}
            className="search-clear"
            onClick={clear}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        )}
      </div>
    </form>
  );
}
