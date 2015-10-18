macro describe {
    rule { ($x:expr (,) ...) } => { }
}

macro it {
    rule { ($x:expr (,) ...) } => { }
}

export describe;
export it;
