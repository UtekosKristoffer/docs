# React Hook Form – Eksempelsamling og bruk av ErrorMessage

Denne filen viser eksempler på bruk av React Hook Form sammen med ErrorMessage-komponenten, både for enkel og flere feilmeldinger, samt hvordan ErrorMessage kan utvides for mer avansert bruk. I tillegg demonstreres beste praksis for error messages, direkte fra React Hook Form-dokumentasjonen.

---

## Grunnleggende: Error Messages med `register`

Error messages er visuell tilbakemelding til brukeren når det er feil i input. Du kan angi en tilpasset feilmelding direkte på valideringsregelen via `message`-feltet:

```tsx
import { useForm } from "react-hook-form";

export default function App() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input
        {...register("test", {
          maxLength: { value: 2, message: "Maks 2 tegn er tillatt" },
        })}
      />
      {errors.test && <span>{errors.test.message}</span>}
      <input type="submit" />
    </form>
  );
}
```

---

## Optional Chaining for feiluttrekk

For å unngå feil ved tilgang til feilobjekter som kan være `undefined`, bruk optional chaining (`?.`). Dette gir trygg og eksplisitt tilgang til error-meldingen.

```tsx
<span>{errors?.firstName?.message}</span>
```

---

## Bruk av lodash `get` for dype feilstrukturer

Dersom du bruker lodash i prosjektet, kan du hente ut nested felter med `get`-funksjonen:

```tsx
import get from "lodash.get";

<span>{get(errors, "firstName.message")}</span>
```

---

## Enkelt feilmeldingseksempel

```tsx
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";

interface FormInputs {
  singleErrorInput: string;
}

export default function App() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormInputs>();
  const onSubmit = (data: FormInputs) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("singleErrorInput", { required: "Dette feltet er påkrevd." })}
      />
      <ErrorMessage errors={errors} name="singleErrorInput" />

      <ErrorMessage
        errors={errors}
        name="singleErrorInput"
        render={({ message }) => <p>{message}</p>}
      />

      <input type="submit" />
    </form>
  );
}
```

---

## Flere feilmeldinger for samme felt

```tsx
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";

interface FormInputs {
  multipleErrorInput: string;
}

export default function App() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormInputs>({
    criteriaMode: "all",
  });
  const onSubmit = (data: FormInputs) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("multipleErrorInput", {
          required: "Dette feltet er påkrevd.",
          pattern: {
            value: /\d+/,
            message: "Dette feltet må være et tall.",
          },
          maxLength: {
            value: 10,
            message: "Feltet overstiger maks lengde.",
          },
        })}
      />
      <ErrorMessage
        errors={errors}
        name="multipleErrorInput"
        render={({ messages }) =>
          messages &&
          Object.entries(messages).map(([type, message]) => (
            <p key={type}>{message}</p>
          ))
        }
      />

      <input type="submit" />
    </form>
  );
}
```

---

## Avansert: Utvidelse av ErrorMessage

```tsx
import * as React from "react";
import { useFormContext, get, FieldErrors } from "react-hook-form";
import { Props } from "./types";

const ErrorMessage = <
  TFieldErrors extends FieldErrors,
  TAs extends
    | undefined
    | React.ReactElement
    | React.ComponentType<any>
    | keyof JSX.IntrinsicElements = undefined
>({
  as,
  errors,
  name,
  message,
  render,
  ...rest
}: Props<TFieldErrors, TAs>) => {
  const methods = useFormContext();
  const error = get(errors || methods.formState.errors, name);

  if (!error) {
    return null;
  }

  const { message: messageFromRegister, types } = error;
  const props = Object.assign({}, rest, {
    children: messageFromRegister || message,
  });

  return React.isValidElement(as)
    ? React.cloneElement(as, props)
    : render
    ? (render({
        message: messageFromRegister || message,
        messages: types,
      }) as React.ReactElement)
    : React.createElement((as as string) || React.Fragment, props);
};

export { ErrorMessage };
```

---

## Viktige punkter

- Bruk `ErrorMessage` fra `@hookform/error-message` for enkel og fleksibel visning av feilmeldinger.
- Sett feilmeldinger direkte i `register`-objektet via `message`-feltet på reglene.
- `render`-prop gir deg full kontroll over hvordan feilmeldinger vises.
- Med `criteriaMode: "all"` kan du vise flere feilmeldinger for samme felt.
- Bruk optional chaining eller lodash `get` for trygg uthenting av feilmeldinger.
- Komponentens API kan utvides for enda større fleksibilitet og kontroll.

For mer informasjon, se [dokumentasjonen til React Hook Form](https://react-hook-form.com/).