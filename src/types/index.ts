// Template Catalog API Types
export interface Template {
  id: string;
  name: string;
  title?: string;
  display_name?: string;
  json_data?: any;
  category?: string;
  collection?: string;
  designer?: string;
  tags?: string[];
  thumbnail?: string;
  data?: any;
}

export interface Category {
  id: string;
  name: string;
}

export interface Collection {
  id: string;
  name: string;
}

export interface Designer {
  id: string;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
}

// Brand Styles Types
export interface BrandStyles {
  styles: {
    general?: {
      backgroundColor?: string;
      contentAreaBackgroundColor?: string;
      contentAreaWidth?: string;
      defaultFont?: string;
      linkColor?: string;
    };
    title?: {
      color?: string;
      fontSize?: string;
      fontFamily?: string;
      fontWeight?: string;
      lineHeight?: string;
      textAlign?: string;
    };
    h1?: {
      color?: string;
      fontSize?: string;
      fontFamily?: string;
      fontWeight?: string;
      lineHeight?: string;
    };
    h2?: {
      color?: string;
      fontSize?: string;
      fontFamily?: string;
      fontWeight?: string;
      lineHeight?: string;
    };
    paragraph?: {
      styles?: {
        color?: string;
        fontSize?: string;
        fontFamily?: string;
        fontWeight?: string;
        lineHeight?: string;
      };
    };
    button?: {
      styles?: {
        color?: string;
        fontSize?: string;
        fontFamily?: string;
        fontWeight?: string;
        backgroundColor?: string;
        lineHeight?: string;
        paddingTop?: string;
        paddingRight?: string;
        paddingBottom?: string;
        paddingLeft?: string;
      };
    };
    [key: string]: any;
  };
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success?: boolean;
  error?: string;
}

export interface TemplatesResponse {
  templates: Template[];
  total?: number;
  limit?: number;
  offset?: number;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface CollectionsResponse {
  collections: Collection[];
}

export interface DesignersResponse {
  designers: Designer[];
}

export interface TagsResponse {
  tags: Tag[];
}

// Beefree SDK Types
export interface BeefreeConfig {
  container: string;
  sidebarPosition?: 'left' | 'right';
  defaultModulesOrder?: string[];
  modulesGroups?: Array<{
    label: string;
    collapsable: boolean;
    collapsedOnLoad: boolean;
    modulesNames: string[];
  }>;
  translations?: Record<string, Record<string, string>>;
}

export interface BeefreeToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}
