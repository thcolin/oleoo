use std::{env, fs, path::Path};

// rules.json lives at the root of the monorepo, shared with the other ports: it is copied into the crate at build time.
fn main() {
    let rules = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../rules.json");
    println!("cargo::rerun-if-changed={}", rules.display());
    fs::copy(
        &rules,
        Path::new(&env::var("OUT_DIR").unwrap()).join("rules.json"),
    )
    .unwrap_or_else(|e| panic!("cannot read {}: {e}", rules.display()));
}
