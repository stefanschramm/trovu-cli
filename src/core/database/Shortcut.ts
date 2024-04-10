export type Shortcut = {
  /** Shortcuts with include attribute might not have urls */
  readonly url?: string;
  readonly title?: string;
  /** The include property is not readonly because we remove it while processing. */
  include?: IncludeDefinition;
  readonly deprecated?: {
    readonly alternative?: {
      readonly query: string;
    };
    readonly created: string;
  };
  // TODO: other properties?
};
// TODO: differentiate between RawShortcut (without url but possibly with include) and Shortcut (with url and without include)

// TODO: Support "Short notation" like "examplekeyword 1: http://www.example.com/?q=<param1>"

// Currently only ObjectShortcutDatabase is implementing this interface.
// But nevertheless it's good to define it in case we want to switch to some other implementation (redis, sqlite, ...) someday.
export interface ShortcutDatabase {
  /**
   * @param language Language to use when replacing search keys of includes
   */
  getShortcut(keyword: string, argumentCount: number, language: string): Shortcut | undefined;
}

export interface ShortcutDatabaseFactory {
  /**
   * Returns ShortcutDatabase for the specified namespaces.
   *
   * The order of namespaces is important for prioritization.
   **/
  getShortcutDatabaseByNamespaces(namespaces: string[]): ShortcutDatabase;
}

export type IncludeDefinition = SimpleIncludeDefinition | NamespaceIncludeDefinition[];

type SimpleIncludeDefinition = {
  readonly key: string;
};

type NamespaceIncludeDefinition = {
  readonly key: string;
  readonly namespace: string;
};
