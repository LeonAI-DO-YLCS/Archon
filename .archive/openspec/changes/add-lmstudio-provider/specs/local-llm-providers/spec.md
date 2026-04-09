## ADDED Requirements

### Requirement: LMStudio Provider Support

The system SHALL support LMStudio as a local LLM provider for both text generation and embeddings.

#### Scenario: User selects LMStudio as Chat Provider

- **WHEN** the user selects "LMStudio" from the provider list
- **THEN** the settings UI displays a configuration input for "Base URL"
- **AND** the default Base URL is set to `http://host.docker.internal:1234/v1`

#### Scenario: Connection Validation

- **WHEN** the user clicks "Test Connection" for LMStudio
- **THEN** the system attempts to reach the configured Base URL
- **AND** returns a success message if the LMStudio server responds with a valid model list
- **OR** returns an error message if the server is unreachable

#### Scenario: Model Discovery

- **WHEN** the connection is successful
- **THEN** the system automatically populates the "Chat Model" and "Embedding Model" dropdowns with models retrieved from LMStudio

### Requirement: LMStudio Embeddings

The system SHALL support generating vector embeddings using LMStudio models.

#### Scenario: Embedding Generation

- **WHEN** the embedding provider is set to "LMStudio"
- **THEN** the system routes embedding requests to the configured LMStudio `/v1/embeddings` endpoint
