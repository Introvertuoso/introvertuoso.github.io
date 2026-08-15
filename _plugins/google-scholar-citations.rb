require "active_support/all"
require 'nokogiri'
require 'open-uri'

module Helpers
  extend ActiveSupport::NumberHelper
end

module Jekyll
  class GoogleScholarCitationsTag < Liquid::Tag
    Citations = { }

    def initialize(tag_name, params, tokens)
      super
      splitted = params.split(" ").map(&:strip)
      @scholar_id = splitted[0]
      @article_id = splitted[1]
    end

    def render(context)
      article_id = context[@article_id.strip]
      site = context.registers[:site]

      # Check if cached in data/citations.json
      if site.data['citations'] && site.data['citations']['citations'] && site.data['citations']['citations'][article_id]
        return site.data['citations']['citations'][article_id].to_s
      end

      # Return previously cached in-memory count if exists
      if GoogleScholarCitationsTag::Citations[article_id]
        return GoogleScholarCitationsTag::Citations[article_id]
      end

      # Fallback without blocking network requests
      citation_count = "N/A"
      GoogleScholarCitationsTag::Citations[article_id] = citation_count
      return citation_count
    end
  end
end

Liquid::Template.register_tag('google_scholar_citations', Jekyll::GoogleScholarCitationsTag)
